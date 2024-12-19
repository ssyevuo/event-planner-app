//event listener that will ensure that the form is submitted successfully and dynamically include the events
const eventList = document.getElementById('event-list');
const eventForm = document.getElementById('event-form');
const noEvenstMessage = document.getElementById('no-events');
const searchInput = document.getElementById('event-search');

//local storage initialization
let events =JSON.parse(localStorage.getItem('events')) || [];

//saving the events to local storage
function saveToLocalStorage() {
    localStorage.setItem('events', JSON.stringify(events));
}

//searching events event listener
searchInput.addEventListener('input', function(event) {
    const query = event.target.value.toLowerCase(); //convert to lowercase to ensure that users dont have to think of case

    //helps filtering the events
    const filteredEvents = events.filter(event => 
        event.name.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query)
    );

    //rendering filtered events
    renderEventList(filteredEvents);
});


function renderEventList(filteredEvents = events) {
    eventList.innerHTML = '';

    if (events.length === 0) {
        noEvenstMessage.style.display = 'block';
    } else {
        noEvenstMessage.style.display = 'none';
        filteredEvents.forEach((event, index) => {
            const eventCard = document.createElement('div');
            eventCard.classList.add('event');
            eventCard.setAttribute('data-index', index);

            eventCard.innerHTML = `
                <h3 class="event-name">${event.name}</h3>
                <p><strong>Date:</strong> ${event.date}</p>
                <p><strong>Location:</strong> ${event.location}</p>
                <p class="event-description">${event.description}</p>
                ${event.weather ? `<p><strong>Weather: </strong> ${event.weather}</p>` : ''}
                ${event.temperature ? `<p><strong>Temperature: </strong> ${event.temperature}°C</p>` : ''}
                <button class="event-button delete-button" data-index="${index}">Delete</button>
                <button class="event-button edit-button" data-index="${index}">Edit</button>
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

    const editIndex = document.getElementById('event-form').dataset.editIndex;

    if (editIndex !== undefined) {
        // Update the event
        events[editIndex] = { name, date, location, description };
        delete document.getElementById('event-form').dataset.editIndex; // Remove edit index
    } else {
        // Add new event
        const newEvent = { name, date, location, description };
        events.push(newEvent);
    }


    //event card saving edited event
    saveToLocalStorage();
    renderEventList();
    
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

        document.getElementById('event-form').dataset.editIndex = index;
    }
});

renderEventList();




