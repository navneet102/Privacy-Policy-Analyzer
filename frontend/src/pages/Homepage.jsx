const Homepage = () => {
    const handleSearchQuery = async (event) => {
        try {
            event.preventDefault(); // Remove this in future if needed.
            console.log("Query fulfilled!!");
        }
        catch {
            console.error("There was an error in processing your request. Following is the error :", error);
        }
    }

    return (<div className="flex flex-row justify-center p-24 bg-primary rounded-b-4xl">
        <label className="input py-6">
            <svg className="h-[1.5em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <g
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                    fill="none"
                    stroke="currentColor"
                >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                </g>
            </svg>
            <form onSubmit={handleSearchQuery}>
                <input className="p-2 text-[16px]" type="search" required placeholder="Search"  />
            </form>
        </label>
    </div>)
}

export default Homepage;