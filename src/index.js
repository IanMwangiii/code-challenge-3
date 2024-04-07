document.addEventListener('DOMContentLoaded', () => {
  const menu = document.querySelector('#films');
  const details = document.querySelector('#film-details');
  const ticketBtn = document.querySelector('#buy-ticket');

  // Function to fetch details of a single film
  const fetchFilm = async (id) => {
    const response = await fetch(`http://localhost:3000/films/${id}`);
    const film = await response.json();
    return film;
  };

  // Function to fetch details of all films
  const fetchAllFilms = async () => {
    const response = await fetch(`http://localhost:3000/films`);
    const films = await response.json();
    return films;
  };

  // Function to purchase a ticket for a film
  const purchaseTicket = async (id) => {
    const film = await fetchFilm(id);
    if (film.tickets_sold < film.capacity) {
      const response = await fetch(`http://localhost:3000/films/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tickets_sold: film.tickets_sold + 1 })
      });
      const updatedFilm = await response.json();
      return updatedFilm;
    } else {
      alert('Tickets for this showing are sold out.');
    }
  };

  // Function to display details of a single film
  const displayFilmDetails = (film) => {
    details.innerHTML = `
      <h2>${film.title}</h2>
      <img src="${film.poster}" alt="${film.title}">
      <p>Runtime: ${film.runtime} minutes</p>
      <p>Showtime: ${film.showtime}</p>
      <p>Available Tickets: ${film.capacity - film.tickets_sold}</p>
      <p>${film.description}</p>
    `;
  };

  // Function to display all films in the menu
  const displayAllFilms = (films) => {
    menu.innerHTML = '';
    films.forEach((film) => {
      const li = document.createElement('li');
      li.classList.add('film', 'item');
      li.textContent = film.title;
      li.dataset.id = film.id;
      menu.appendChild(li);
    });
  };

  // Event handler for ticket purchase
  const handleTicketPurchase = (event) => {
    event.preventDefault();
    const id = event.target.dataset.id;
    purchaseTicket(id)
      .then((updatedFilm) => {
        displayFilmDetails(updatedFilm);
      });
  };

  // Event handler for film selection
  const handleFilmSelection = async (event) => {
    if (event.target.tagName === 'LI') {
      const id = event.target.dataset.id;
      const film = await fetchFilm(id);
      displayFilmDetails(film);
    }
  };

  // Event handler for film deletion
  const handleFilmDeletion = async (event) => {
    if (event.target.tagName === 'BUTTON') {
      const id = event.target.dataset.id;
      if (confirm('Are you sure you want to delete this film?')) {
        await fetch(`http://localhost:3000/films/${id}`, {
          method: 'DELETE'
        });
        const films = await fetchAllFilms();
        displayAllFilms(films);
      }
    }
  };

  // Event listeners setup
  menu.addEventListener('click', handleFilmSelection);
  ticketBtn.addEventListener('click', handleTicketPurchase);
  menu.addEventListener('click', handleFilmDeletion);

  // Initial data fetching and display
  fetchAllFilms().then(displayAllFilms);
  fetchFilm(1).then(displayFilmDetails);
});
