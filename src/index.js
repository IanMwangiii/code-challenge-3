document.addEventListener('DOMContentLoaded', () => {
  const filmMenu = document.querySelector('#films');
  const filmDetails = document.querySelector('#film-details');
  const ticketButton = document.querySelector('#buy-ticket');

  // Function to get a single film
  const getFilm = async (id) => {
    const response = await fetch(`http://localhost:3000/films/${id}`);
    const film = await response.json();
    return film;
  };

  // Function to get all films
  const getAllFilms = async () => {
    const response = await fetch(`http://localhost:3000/films`);
    const films = await response.json();
    return films;
  };

  // Function to buy a ticket
  const buyTicket = async (id) => {
    const film = await getFilm(id);
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
      alert('This showing is sold out.');
    }
  };

  // Function to display a single film
  const displayFilm = (film) => {
    filmDetails.innerHTML = `
      <h2>${film.title}</h2>
      <img src="${film.poster}" alt="${film.title}">
      <p>Runtime: ${film.runtime} minutes</p>
      <p>Showtime: ${film.showtime}</p>
      <p>Available Tickets: ${film.capacity - film.tickets_sold}</p>
      <p>${film.description}</p>
    `;
  };

  // Function to display all films
  const displayAllFilms = (films) => {
    filmMenu.innerHTML = '';
    films.forEach((film) => {
      const li = document.createElement('li');
      li.classList.add('film', 'item');
      li.textContent = film.title;
      li.dataset.id = film.id;
      filmMenu.appendChild(li);
    });
  };

  // Function to handle ticket purchase
  const handleTicketPurchase = (event) => {
    event.preventDefault();
    const id = event.target.dataset.id;
    buyTicket(id)
      .then((updatedFilm) => {
        displayFilm(updatedFilm);
      });
  };

  // Function to handle film selection
  const handleFilmSelection = async (event) => {
    if (event.target.tagName === 'LI') {
      const id = event.target.dataset.id;
      const film = await getFilm(id);
      displayFilm(film);
    }
  };

  
const handleFilmDeletion = async (event) => {
  if (event.target.tagName === 'BUTTON') {
    const id = event.target.dataset.id;
    if (confirm('Are you sure you want to delete this film?')) {
      await fetch(`http://localhost:3000/films/${id}`, {
        method: 'DELETE'
      });
      const films = await getAllFilms();
      displayAllFilms(films);
    }
  }
};

  // Event listeners
  filmMenu.addEventListener('click', handleFilmSelection);
  ticketButton.addEventListener('click', handleTicketPurchase);
  filmMenu.addEventListener('click', handleFilmDeletion);

  // Initial display
  getAllFilms().then(displayAllFilms);
  getFilm(1).then(displayFilm);
});