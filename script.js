// Function to show different pages
function showPage(page) {
        document.getElementById('home').style.display = 'none';
        document.getElementById('variable').style.display = 'none';
        document.getElementById('prognostic').style.display = 'none';
        document.getElementById(page).style.display = 'block';
}
  
const url = "https://api.open-meteo.com/v1/forecast?latitude=25.7617&longitude=-80.1918&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FNew_York"
// Dict of Cities
const citiesDict = {'mia':['Miami', '25.7617', '-80.1918'],
                'orl':['Orlando', '28.5383', '-81.3792'],
                'tal':['Talahassee', '30.4382', '-84.2806']
              };

//Function to display the date value of the API in the Select
//It updates every day removing the last day and adding a new one because it uses the API's time value
async function SelectDateGenerator() {
        try {
          const response = await fetch(url);
          const data = await response.json();
        
          const dates = data.daily.time;
          console.log(dates)
          const cities = ["mia", "orl", "tal"];
          cities.forEach(city => {
              const select = document.getElementById(`${city}-select-date`);
              console.log(`Element with ID "${city}-select-date"`)
              if (!select) {
                console.error(`Select element with ID "${city}-select-date" not found.`);
                return;
              }
              dates.forEach((date, index) => {
                    const option = document.createElement("option");
                    option.value = index;
                    option.textContent = date; 
                    select.appendChild(option);
                });  
            }
          )            
        } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  }

//Function to handle the date selected by the users
function Selection(cityKey) {  
    let cityEntry = citiesDict[cityKey];
    let selectObj = document.getElementById(`${cityKey}-select-date`); 
    let selectedId = ''
    let selectedText = ''
    if (cityEntry && selectObj) {
        console.log(cityEntry)  
        const selectedOption = selectObj.options[selectObj.selectedIndex];     
        selectedId = selectedOption.value;
        selectedText = selectedOption.textContent; 
        console.log(selectedId)
        console.log(selectedText)    

    } else {
      console.error(`City "${cityKey}" or its associated select element not found.`);              
    };
    return [cityEntry, selectedId, selectedText];
};

//Function to extract the weather data of the selected day from the API and display it in the Weather Page
async function GetWeather(cityKey) {
  let cityDataEntry = Selection(cityKey) 
  console.log(`cityDataEntry:  ${cityDataEntry}`)
  let cityLatitude = cityDataEntry[0][1]
  let cityLongitude = cityDataEntry[0][2]
  let cityName = cityDataEntry[0][0]
  let selectedId = cityDataEntry[1]
  let selectedDate = cityDataEntry[2]
  console.log(`lat: ${cityLatitude}, lon: ${cityLongitude}.`)
  const url = "https://api.open-meteo.com/v1/forecast?"+
      "latitude=" + cityLatitude + "&"+
      "longitude=" + cityLongitude + "&"+
      "daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&"+
      "temperature_unit=fahrenheit&"+
      "wind_speed_unit=mph&"+
      "precipitation_unit=inch&"+
      "timezone=America%2FNew_York";
    console.log(`URL: ${url}`)
    console.log(cityName)
    // Display the data in the 'selectedInfo' div
    const infoDiv = document.getElementById("selectedInfo"); 
    //This constant is used to stop the app from trying to find data when the user selects "Select a Date", which displayed undefine
    const INVALID_SELECTION = 10;
    if (selectedId != INVALID_SELECTION) {       
        try {
          const response = await fetch(url);
          console.log("Raw response:", response);
          if (!response.ok) {
            console.log(`Responce Error fetch`)
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          if (!data || !data.daily) throw new Error("Invalid API response")
          
          const weatherData = data.daily;      
          console.log(`weatherData: ${weatherData}`)
          console.log (selectedDate);
          const maxTemp = weatherData.temperature_2m_max[selectedId];
          const minTemp = weatherData.temperature_2m_min[selectedId];
          const maxWindSpeed = weatherData.wind_speed_10m_max[selectedId];
          const precipitationProbability = weatherData.precipitation_probability_max[selectedId];

          
          if (infoDiv) {
            infoDiv.innerHTML = `
              <h2>Weather Information for ${cityName} on ${selectedDate}</h2>
              <p><strong>Max Temperature:</strong> ${maxTemp}°F</p>
              <p><strong>Min Temperature:</strong> ${minTemp}°F</p>
              <p><strong>Max Wind Speed:</strong> ${maxWindSpeed} mph</p>
              <p><strong>Precipitation Probability:</strong> ${precipitationProbability}%</p>
            `;
          } else {
            console.error("Info div not found in the DOM.");
          }
        } catch (error) {
          console.error("Error fetching weather data:", error);
        };
    } else{
      infoDiv.innerHTML = ""
    };

}

SelectDateGenerator();