import assert from "node:assert";
import { withRetry, parseErrorDetails } from "../lib/retry.js";

async function runAllTests() {
  console.log("Starting Retry Logic Test Suite...\n");

  // --- Test 1: parseErrorDetails handles HTTP 429 and RESOURCE_EXHAUSTED ---
  {
    const err = new Error(
      'got status: 429 Too Many Requests. {"error":{"code":429,"message":"Resource has been exhausted (e.g. check quota).","status":"RESOURCE_EXHAUSTED"}}'
    );
    const parsed = parseErrorDetails(err);
    assert.strictEqual(parsed.statusCode, 429, "Status code should be 429");
    assert.strictEqual(parsed.rpcStatus, "RESOURCE_EXHAUSTED", "RPC status should be RESOURCE_EXHAUSTED");
    assert.strictEqual(parsed.isTransient, true, "429 should be transient");
    assert.strictEqual(parsed.isDailyQuota, false, "Standard 429 is not daily quota");
    assert.ok(parsed.userFriendlyMessage.includes("rate limits"), "Should have rate limit message");
    console.log("✓ Test 1 Passed: 429 / RESOURCE_EXHAUSTED parsed accurately");
  }

  // --- Test 2: parseErrorDetails handles HTTP 503 Service Unavailable ---
  {
    const err = new Error(
      'got status: 503 Service Unavailable. {"error":{"code":503,"message":"The model is currently experiencing high demand.","status":"UNAVAILABLE"}}'
    );
    const parsed = parseErrorDetails(err);
    assert.strictEqual(parsed.statusCode, 503, "Status code should be 503");
    assert.strictEqual(parsed.rpcStatus, "UNAVAILABLE", "RPC status should be UNAVAILABLE");
    assert.strictEqual(parsed.isTransient, true, "503 should be transient");
    assert.ok(parsed.userFriendlyMessage.includes("high demand"), "Should have high demand message");
    console.log("✓ Test 2 Passed: 503 / UNAVAILABLE parsed accurately");
  }

  // --- Test 3: parseErrorDetails extracts RetryInfo delay ---
  {
    const err = new Error(
      'got status: 429 Too Many Requests. {"error":{"code":429,"details":[{"@type":"type.googleapis.com/google.rpc.RetryInfo","retryDelay":"8.5s"}]}}'
    );
    const parsed = parseErrorDetails(err);
    assert.strictEqual(parsed.retryAfterMs, 8500, "Should parse retryDelay as 8500ms");
    console.log("✓ Test 3 Passed: google.rpc.RetryInfo parsed correctly");
  }

  // --- Test 4: parseErrorDetails identifies Daily Quota exhaustion ---
  {
    const err = new Error(
      'got status: 429 Resource Exhausted. {"error":{"code":429,"message":"Quota exceeded for quota metric GenerateContentRequestsPerDayPerProject"}}'
    );
    const parsed = parseErrorDetails(err);
    assert.strictEqual(parsed.isDailyQuota, true, "Should identify daily quota");
    assert.strictEqual(parsed.isTransient, false, "Daily quota must NOT be transient");
    assert.ok(parsed.userFriendlyMessage.includes("daily request quota"), "Should have daily quota message");
    console.log("✓ Test 4 Passed: Daily quota exhaustion detected as non-transient");
  }

  // --- Test 5: parseErrorDetails identifies Invalid API Key ---
  {
    const err = new Error(
      'got status: 400 Bad Request. {"error":{"code":400,"message":"API key not valid. Please pass a valid API key."}}'
    );
    const parsed = parseErrorDetails(err);
    assert.strictEqual(parsed.isInvalidKey, true, "Should identify invalid API key");
    assert.strictEqual(parsed.isTransient, false, "Invalid API key must NOT be transient");
    assert.ok(parsed.userFriendlyMessage.includes("Invalid Gemini API Key"), "Should prompt to check GEMINI_API_KEY");
    console.log("✓ Test 5 Passed: Invalid API key detected as non-transient");
  }

  // --- Test 6: withRetry immediately returns on success ---
  {
    let attempts = 0;
    const result = await withRetry(async () => {
      attempts++;
      return { success: true };
    });
    assert.deepStrictEqual(result, { success: true });
    assert.strictEqual(attempts, 1, "Should only execute once when successful");
    console.log("✓ Test 6 Passed: withRetry executes immediately without retrying on success");
  }

  // --- Test 7: withRetry retries transient errors with exponential backoff ---
  {
    let attempts = 0;
    const retryDelays = [];
    const result = await withRetry(
      async () => {
        attempts++;
        if (attempts <= 2) {
          throw new Error('got status: 503 Service Unavailable.');
        }
        return "success_after_503";
      },
      {
        maxRetries: 3,
        initialDelayMs: 40,
        backoffFactor: 2,
        jitterMs: 10,
        operationName: "Test503Recovery",
        onRetry: (_err, _attempt, delayMs) => {
          retryDelays.push(delayMs);
        },
      }
    );

    assert.strictEqual(result, "success_after_503");
    assert.strictEqual(attempts, 3, "Should take 3 attempts (2 failures + 1 success)");
    assert.strictEqual(retryDelays.length, 2, "Should have 2 retries logged");
    // Verify exponential progression: 2nd delay should generally be larger than 1st
    assert.ok(retryDelays[1] >= retryDelays[0], "Delay should increase exponentially");
    console.log("✓ Test 7 Passed: withRetry recovers from transient 503 with exponential delays");
  }

  // --- Test 8: withRetry fails fast on non-transient error ---
  {
    let attempts = 0;
    try {
      await withRetry(
        async () => {
          attempts++;
          throw new Error('got status: 400 Bad Request. {"error":{"message":"API key not valid"}}');
        },
        {
          maxRetries: 4,
          initialDelayMs: 20,
          operationName: "TestFailFast",
        }
      );
      assert.fail("Should have thrown error");
    } catch (e) {
      assert.strictEqual(attempts, 1, "Should NOT retry on 400 Bad Request");
      assert.ok(e.userFriendlyMessage.includes("Invalid Gemini API Key"));
      console.log("✓ Test 8 Passed: withRetry fails fast on non-transient error");
    }
  }

  // --- Test 9: withRetry respects RetryInfo delay if provided ---
  {
    let loggedDelay = null;
    let attempts = 0;
    const result = await withRetry(
      async () => {
        attempts++;
        if (attempts === 1) {
          throw new Error(
            'got status: 429 Too Many Requests. {"error":{"code":429,"details":[{"@type":"type.googleapis.com/google.rpc.RetryInfo","retryDelay":"0.1s"}]}}'
          );
        }
        return "retry_delay_success";
      },
      {
        maxRetries: 2,
        initialDelayMs: 10,
        jitterMs: 5,
        operationName: "TestRetryDelay",
        onRetry: (_err, _attempt, delayMs) => {
          loggedDelay = delayMs;
        },
      }
    );

    assert.strictEqual(result, "retry_delay_success");
    assert.ok(loggedDelay >= 100, `Delay should respect RetryInfo 100ms (was: ${loggedDelay}ms)`);
    console.log("✓ Test 9 Passed: withRetry respects Google RetryInfo delay");
  }

  // --- Test 10: withRetry throws friendly error after exhausting all retries ---
  {
    let attempts = 0;
    try {
      await withRetry(
        async () => {
          attempts++;
          throw new Error("got status: 503 Service Unavailable. The model is overloaded.");
        },
        {
          maxRetries: 2,
          initialDelayMs: 20,
          jitterMs: 5,
          operationName: "TestExhaustion",
        }
      );
      assert.fail("Should have thrown exhausted error");
    } catch (e) {
      assert.strictEqual(attempts, 3, "Total attempts should be 1 initial + 2 retries = 3");
      assert.ok(e.userFriendlyMessage.includes("high demand"));
      console.log("✓ Test 10 Passed: withRetry attaches friendly message upon retry exhaustion");
    }
  }

  console.log("\nAll 10 tests passed successfully!");
}

runAllTests().catch((err) => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
