document.addEventListener('DOMContentLoaded', function() {
    // index.js
    // Define base API URL
    const weatherApi = "https://api.weather.gov/alerts/active";
    
    // Define button
    const button = document.getElementById("fetch-alerts");
    
    // Define input element
    const stateInput = document.getElementById("state-input");
    
    // Define the display container element
    const alertsDisplayDiv = document.getElementById("alerts-display");

    // Add event listener to the button
    button.addEventListener('click', function() {
        // Get value from input field and convert to uppercase for API
        const stateAbbreviation = stateInput.value.trim().toUpperCase();

        // Basic validation
        if (stateAbbreviation.length !== 2) {
            alertsDisplayDiv.textContent = 'Please enter a two-letter state abbreviation.';
            return;
        }

        // Activate function with input's value
        fetchWeatherAlerts(stateAbbreviation);
    });

    // Function to make a GET request to the API
    function fetchWeatherAlerts(stateAbbreviation) {
        // Construct the full API URL
        const fullUrl = `${weatherApi}?area=${stateAbbreviation}`;

        // Clear previous alerts before fetching new ones
        alertsDisplayDiv.innerHTML = "";

        fetch(fullUrl)
            .then(response => {
                if (!response.ok) {
                    // Throw an error if the response status is not OK (e.g., 404, 500)
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Call the display function with the fetched data and state
                displayAlerts(data, stateAbbreviation);
            })
            .catch(error => {
                console.error("Fetch Error:", error);
                // Display a user-friendly error message
                if (error.message.includes('NetworkError')) {
                    alertsDisplayDiv.innerHTML = `Network error: Unable to connect to the weather service. Please check your internet connection.`;
                } else if (error.message.includes('HTTP error')) {
                    alertsDisplayDiv.innerHTML = `Error: Unable to fetch weather data for ${stateAbbreviation}. The server may be unavailable or the state abbreviation may be incorrect.`;
                } else {
                    alertsDisplayDiv.innerHTML = `Unexpected error: ${error.message}. Please try again later.`;
                }
            });
    }

    // Function to dynamically update DOM with fetched alerts
    function displayAlerts(data, stateAbbreviation) {
        // Clear the loading message or previous content
        alertsDisplayDiv.innerHTML = '';

        // Check for no alerts
        if (!data.features || data.features.length === 0) {
            alertsDisplayDiv.textContent = `✅ No active weather alerts for ${stateAbbreviation}.`;
            return;
        }

        const numberOfAlerts = data.features.length;

        // Create and append the summary message using a template literal (backticks)
        const summaryMessage = document.createElement("h3");
        summaryMessage.textContent = `Current watches, warnings, and advisories for ${stateAbbreviation}: ${numberOfAlerts} active alert(s)`;
        alertsDisplayDiv.append(summaryMessage);

        // Create an unordered list to hold the alerts
        const alertsList = document.createElement("ul");

        // Iterate through the alerts and create DOM elements
        data.features.forEach(feature => {
            const headline = document.createElement('li');
            
            // Bold the headline
            const headlineText = document.createElement('strong');
            headlineText.textContent = feature.properties.headline || 'Weather Alert';
            headline.append(headlineText);

            // Create and append the description paragraph
            const description = document.createElement('p');
            description.textContent = feature.properties.description;
            headline.append(description);

            alertsList.append(headline);
        });

        // Append the list to the display container
        alertsDisplayDiv.append(alertsList);

        // Clear input field (correctly targeting the input element)
        stateInput.value = "";
    }
});

