//event listener that will ensure that the form is submitted successfully and dynamically include the events
const eventList = document.getElementById('event-list');
const eventForm = document.getElementById('event-form');
const noEvenstMessage = document.getElementById('no-events');

//local storage initialization
let events =JSON.parse(localStorage.getItem('events')) || [];

//saving the events to local storage
function saveToLocalStorage() {
    localStorage.setItem('events', JSON.stringify(events));
}

function renderEventList() {
    eventList.innerHTML = '';

    if (events.length === 0) {
        noEvenstMessage.style.display = 'block';
    } else {
        noEvenstMessage.style.display = 'none';
        events.forEach((event, index) => {
            const eventCard = document.createElement('div');
            eventCard.classList.add('event');

            eventCard.innerHTML = `
                <h3 class="event-name">${event.name}</h3>
                <p><strong>Date:</strong> ${event.date}</p>
                <p><strong>Location:</strong> ${event.location}</p>
                <p class="event-description">${event.description}</p>
                ${event.weather ? `<p><strong>Weather: </strong> ${event.weather}</p>` : ''}
                ${event.temperature ? `<p><strong>Temperature: </strong> ${event.temperature}°C</p>` : ''}
                <button class="event-button delete-button">Delete</button>
                <button class="event-button edit-button">Edit</button>
            `;

            //fetching the weather
            if (!event.weather || !event.temperature) {
                fetchWeather(event.location, eventCard, index);
            }

            eventList.appendChild(eventCard);
        });
    }
}

//public api integration for the weather data
function fetchWeather(city, eventCard, eventIndex) {
    const apiKey = 'bb9c6a76c34294515132544077ea38ed';
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`) 
        .then(response => response.json())
        .then(data => {
            if (data.cod !== 200) {
                alert(`Error fetching weather: ${data.message}`);
                return;
            }

            const weather = data.weather[0].description;
            const temp = data.main.temp;

            //ensuring the persistency of the data
            events[eventIndex].weather = weather;
            events[eventIndex].temperature = temp;
            saveToLocalStorage();
            
            //helps with adding weather into the card
            const weatherInfo = `
                <p><strong>Weather: </strong>${weather}</p>
                <p><strong>Temperature: </strong>${temp}°C</p>
            `;

            const buttons = eventCard.querySelector('.delete-button');
            buttons.insertAdjacentHTML('beforebegin', weatherInfo);
        })
        .catch(error => console.error('Error fetching weather:', error));
}

//form submission event listener
eventForm.addEventListener('submit', function(event) {
    //prevents the page from reloading prematurely
    event.preventDefault();    
    
    //form data
    const name = document.getElementById('event-name').value;
    const date = document.getElementById('event-date').value;
    const location = document.getElementById('event-location').value;
    const description = document.getElementById('event-description').value;

    //form validation to ensure thateverything in the form is filled in
    if (!name || !date || !location || !description) {
        alert("Please fill in all the details.");
        return;
    }

    //event card
    const newEvent = { name, date, location, description };
    events.push(newEvent);
    saveToLocalStorage();
    renderEventList();

    // Fetch weather for the event location
    const eventCard = document.querySelector(`[data-index="${events.length - 1}"]`);
    fetchWeather(location, eventCard);

    //reset the form
    eventForm.reset();
});

//deleting and editing functionalities
eventList.addEventListener('click', function(event) {
    const target = event.target;
    const eventCard = target.closest('.event');
    const index = eventCard.getAttribute('data-index');

    //enable deleting in the website for the event list
    if (target.classList.contains('delete-button')) {
        events.splice(index, 1);
        saveToLocalStorage();
        renderEventList();
    }

    //enables editing for the website
    if (target.classList.contains('edit-button')) {
        const eventData = events[index];

        //taking the event details
        document.getElementById('event-name').value = eventData.name;
        document.getElementById('event-date').value = eventData.date;
        document.getElementById('event-location').value = eventData.location;
        document.getElementById('event-description').value = eventData.description;

        //updating as changed
        events.splice(index, 1);
        saveToLocalStorage();
        renderEventList();
    }
});

renderEventList();




