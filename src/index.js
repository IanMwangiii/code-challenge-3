document.addEventListener("DOMContentLoaded", () => {
    const filmsList = document.querySelector("#films");
    const filmDetails = document.querySelector("#film-details");
    const buyTicketBtn = document.querySelector("#buy-ticket");
    const soldOutBtn = document.querySelector("#sold-out");
    
    // Function to fetch film details by ID
    const fetchFilmDetails = async (filmId) => {
      try {
        const response = await fetch(`http://localhost:3000/films/${filmId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const filmData = await response.json();
        displayFilmDetails(filmData);
      } catch (error) {
        console.error("Error fetching film details:", error);
      }
    };
  
    // Function to display film details
    const displayFilmDetails = (filmData) => {
      filmDetails.innerHTML = `
        <img src="${filmData.poster}" alt="${filmData.title} Poster">
        <h2>${filmData.title}</h2>
        <p>Runtime: ${filmData.runtime} minutes</p>
        <p>Showtime: ${filmData.showtime}</p>
        <p>Available Tickets: ${filmData.capacity - filmData.tickets_sold}</p>
        <p>Description: ${filmData.description}</p>
      `;
      if (filmData.capacity - filmData.tickets_sold === 0) {
        soldOutBtn.classList.add("sold-out");
        buyTicketBtn.disabled = true;
        buyTicketBtn.textContent = "Sold Out";
      } else {
        soldOutBtn.classList.remove("sold-out");
        buyTicketBtn.disabled = false;
        buyTicketBtn.textContent = "Buy Ticket";
      }
      buyTicketBtn.dataset.filmId = filmData.id;
    };
  
    // Function to update tickets sold and post new ticket
    const buyTicket = async (filmId) => {
      try {
        const response = await fetch(`http://localhost:3000/films/${filmId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const filmData = await response.json();
        const updatedTicketsSold = filmData.tickets_sold + 1;
        const updatedFilmData = { tickets_sold: updatedTicketsSold };
        const patchResponse = await fetch(`http://localhost:3000/films/${filmId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(updatedFilmData)
        });
        if (!patchResponse.ok) {
          throw new Error(`HTTP error! Status: ${patchResponse.status}`);
        }
        const newTicket = { film_id: filmId, number_of_tickets: 1 };
        const postResponse = await fetch("http://localhost:3000/tickets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(newTicket)
        });
        if (!postResponse.ok) {
          throw new Error(`HTTP error! Status: ${postResponse.status}`);
        }
        fetchFilmDetails(filmId);
      } catch (error) {
        console.error("Error buying ticket:", error);
      }
    };
  
    // Event listener for buying a ticket
    buyTicketBtn.addEventListener("click", () => {
      const filmId = buyTicketBtn.dataset.filmId;
      buyTicket(filmId);
    });
  
    // Function to remove film from list and delete from server
    const removeFilm = async (filmId, filmItem) => {
      try {
        const response = await fetch(`http://localhost:3000/films/${filmId}`, {
          method: "DELETE"
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        filmsList.removeChild(filmItem);
      } catch (error) {
        console.error("Error removing film:", error);
      }
    };
  
    // Event listener for removing a film
    filmsList.addEventListener("click", (event) => {
      if (event.target.matches(".delete-btn")) {
        const filmItem = event.target.closest(".film-item");
        const filmId = filmItem.dataset.id;
        removeFilm(filmId, filmItem);
      }
    });
  
    // Function to render films list
    const renderFilmsList = async () => {
      try {
        const response = await fetch("http://localhost:3000/films");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const filmsData = await response.json();
        filmsList.innerHTML = "";
        filmsData.forEach((filmData) => {
          const filmItem = document.createElement("li");
          filmItem.classList.add("film-item");
          filmItem.dataset.id = filmData.id;
          filmItem.innerHTML = `
            <img src="${filmData.poster}" alt="${filmData.title} Poster">
            <h3>${filmData.title}</h3>
            <button class="delete-btn">Delete</button>
          `;
          filmsList.appendChild(filmItem);
        });
        // Display details of the first film
        fetchFilmDetails(filmsData[0].id);
      } catch (error) {
        console.error("Error rendering films list:", error);
      }
    };
  
    // Initial rendering of films list
    renderFilmsList();
  });
  