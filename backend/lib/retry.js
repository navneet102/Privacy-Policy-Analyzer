/**
 * Utility functions for handling retries with exponential backoff and jitter
 * specifically tuned for Google Gemini API rate limits (429) and high-demand server overloads (503 / 5xx).
 * Reference: https://discuss.ai.google.dev/t/handling-429-503-errors-from-the-gemini-api/124640
 */

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Parses Gemini API and network errors to determine status codes,
 * retry delays, and whether the error is transient or non-recoverable.
 */
export const parseErrorDetails = (error) => {
  if (!error) {
    return {
      statusCode: null,
      rpcStatus: null,
      isTransient: false,
      isDailyQuota: false,
      retryAfterMs: null,
      userFriendlyMessage: 'Unknown error occurred.',
    };
  }

  let statusCode = error.status || error.statusCode || error.code || null;
  let rawMessage = error.message || String(error);
  let rpcStatus = null;
  let retryAfterMs = null;

  // Extract HTTP status code from error message if not directly set on error object
  // (e.g., @google/genai ClientError / ServerError format: "got status: 429 Too Many Requests...")
  if (!statusCode) {
    const statusMatch = rawMessage.match(/got status:\s*(\d{3})/i);
    if (statusMatch) {
      statusCode = parseInt(statusMatch[1], 10);
    }
  }

  // Attempt to parse JSON body embedded in error.message
  const jsonMatch = rawMessage.match(/(\{[\s\S]*\})/);
  if (jsonMatch) {
    try {
      const parsedBody = JSON.parse(jsonMatch[1]);
      if (parsedBody?.error) {
        if (!statusCode && parsedBody.error.code) {
          statusCode = parsedBody.error.code;
        }
        if (parsedBody.error.status) {
          rpcStatus = parsedBody.error.status;
        }

        // Check for google.rpc.RetryInfo or RetryDelay in details
        const details = parsedBody.error.details || [];
        for (const detail of details) {
          if (detail.retryDelay) {
            // e.g., "12s" or "3.5s" or milliseconds
            const seconds = parseFloat(detail.retryDelay);
            if (!isNaN(seconds)) {
              retryAfterMs = Math.round(seconds * 1000);
            }
          }
        }
      }
    } catch {
      // JSON parse failed; continue with regex-based fallbacks
    }
  }

  // Check if Retry-After delay is mentioned in text (e.g., "retry in 15s" or "retry after 10 seconds")
  if (!retryAfterMs) {
    const retryMatch = rawMessage.match(/retry (?:in|after) (\d+(?:\.\d+)?)\s*(s|sec|seconds)?/i);
    if (retryMatch) {
      const val = parseFloat(retryMatch[1]);
      if (!isNaN(val)) {
        retryAfterMs = Math.round(val * 1000);
      }
    }
  }

  // Detect non-recoverable daily quota limits
  const isDailyQuota = /PerDay|RequestsPerDayPerProject|daily quota/i.test(rawMessage);

  // Check for invalid API key
  const isInvalidKey = /API key not valid|API_KEY_INVALID/i.test(rawMessage);

  // Transient classification:
  // 429: Rate limit / Resource exhausted (minute-level tokens or requests)
  // 503: Unavailable / Service overloaded / high demand
  // 500, 502, 504: Internal server error / Bad Gateway / Gateway timeout
  // Network drops: ECONNRESET, ETIMEDOUT, EAI_AGAIN, ENOTFOUND, fetch failed
  const is429 = statusCode === 429 || rpcStatus === 'RESOURCE_EXHAUSTED' || /RESOURCE_EXHAUSTED|rate limit/i.test(rawMessage);
  const is503 = statusCode === 503 || rpcStatus === 'UNAVAILABLE' || /UNAVAILABLE|high demand|overloaded/i.test(rawMessage);
  const is5xx = (statusCode >= 500 && statusCode < 600) || error.name === 'ServerError';
  const isNetworkError = /ECONNRESET|ETIMEDOUT|EAI_AGAIN|ENOTFOUND|UND_ERR_|fetch failed|socket hang up/i.test(rawMessage);

  const isTransient = !isDailyQuota && !isInvalidKey && (is429 || is503 || is5xx || isNetworkError);

  // User-facing friendly messages
  let userFriendlyMessage = null;
  if (isInvalidKey) {
    userFriendlyMessage = 'Invalid Gemini API Key. Please verify your GEMINI_API_KEY environment variable.';
  } else if (isDailyQuota) {
    userFriendlyMessage = 'Gemini API daily request quota reached. Please check your AI Studio quota or try again tomorrow.';
  } else if (is429) {
    userFriendlyMessage = 'The AI service is temporarily busy due to rate limits. Please try again in a few moments.';
  } else if (is503) {
    userFriendlyMessage = 'Google AI service is currently experiencing high demand. Please try again shortly.';
  } else if (is5xx) {
    userFriendlyMessage = 'Google AI service encountered a temporary server error. Please try again shortly.';
  } else if (isNetworkError) {
    userFriendlyMessage = 'Network connection to the AI service timed out. Please check your connection and try again.';
  }

  return {
    statusCode,
    rpcStatus,
    rawMessage,
    isTransient,
    isDailyQuota,
    isInvalidKey,
    retryAfterMs,
    userFriendlyMessage,
  };
};

/**
 * Executes an asynchronous function with exponential backoff and randomized jitter.
 *
 * @param {Function} fn - Async operation to execute
 * @param {Object} options - Configuration options
 * @param {number} [options.maxRetries=4] - Max number of retries before failing
 * @param {number} [options.initialDelayMs=1500] - Initial delay in milliseconds
 * @param {number} [options.backoffFactor=2] - Multiplier for each subsequent retry
 * @param {number} [options.maxDelayMs=30000] - Maximum delay ceiling in milliseconds
 * @param {number} [options.jitterMs=1000] - Random jitter added to backoff delay
 * @param {string} [options.operationName='Gemini Operation'] - Operation label for logging
 * @param {Function} [options.onRetry] - Optional hook called before waiting: (error, attempt, delayMs, maxRetries)
 */
export const withRetry = async (fn, options = {}) => {
  const {
    maxRetries = 4,
    initialDelayMs = 1500,
    backoffFactor = 2,
    maxDelayMs = 30000,
    jitterMs = 1000,
    operationName = 'Gemini Operation',
    onRetry = null,
  } = options;

  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      const details = parseErrorDetails(error);

      // Attach friendly message to error object
      if (details.userFriendlyMessage) {
        error.userFriendlyMessage = details.userFriendlyMessage;
      }

      // Check if we can/should retry
      if (attempt > maxRetries || !details.isTransient) {
        if (!details.isTransient) {
          console.warn(
            `[Retry] ${operationName} failed with non-transient error ` +
            `(Status: ${details.statusCode || 'N/A'}, Reason: ${details.rpcStatus || error.name}). Not retrying.`
          );
        } else {
          console.error(
            `[Retry] ${operationName} exhausted all ${maxRetries} retry attempts. Last error: ${error.message}`
          );
        }
        throw error;
      }

      // Exponential backoff: initialDelay * factor^(attempt - 1)
      const baseDelay = initialDelayMs * Math.pow(backoffFactor, attempt - 1);
      // Add random jitter to prevent synchronized retry spikes
      const jitter = Math.random() * jitterMs;
      let totalDelay = Math.min(maxDelayMs, Math.round(baseDelay + jitter));

      // If Google provided an explicit Retry-After delay, respect it
      if (details.retryAfterMs && details.retryAfterMs > totalDelay) {
        totalDelay = Math.min(maxDelayMs, details.retryAfterMs + Math.round(Math.random() * 500));
      }

      console.warn(
        `[Retry] ${operationName} encountered transient error ` +
        `(Status: ${details.statusCode || details.rpcStatus || 'transient'}). ` +
        `Retrying attempt ${attempt}/${maxRetries} after ${totalDelay}ms...`
      );

      if (typeof onRetry === 'function') {
        try {
          onRetry(error, attempt, totalDelay, maxRetries);
        } catch {
          // Guard against errors inside logging callbacks
        }
      }

      await sleep(totalDelay);
    }
  }
};
