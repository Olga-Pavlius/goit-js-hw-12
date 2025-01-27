import { fetchImages } from './js/pixabay-api.js';
import { renderImages, clearGallery, toggleLoader } from './js/render-functions.js';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.getElementById('search-form');
const loadMoreBtn = document.getElementById('load-more');
let currentPage = 1;
let currentQuery = '';
let totalHits = 0;

const toggleLoadMoreButton = (visible) => {
  loadMoreBtn.classList.toggle('hidden', !visible);
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = event.target.elements.query.value.trim();

  if (!query) {
    iziToast.error({
      title: 'Error',
      message: 'Please enter a search term.',
    });
    return;
  }

  currentQuery = query;
  currentPage = 1;

  clearGallery();
  toggleLoader(true);
  toggleLoadMoreButton(false);

  try {
    const { hits, totalHits: hitsCount } = await fetchImages(currentQuery, currentPage);

    toggleLoader(false);

    if (hits.length === 0) {
      iziToast.info({
        title: 'No results',
        message: 'Sorry, there are no images matching your search query. Please try again!',
      });
      return;
    }

    totalHits = hitsCount;
    renderImages(hits);
    iziToast.success({
      title: 'Success',
      message: `Hooray! We found ${totalHits} images.`,
    });

    if (currentPage * 15 < totalHits) {
      toggleLoadMoreButton(true);
    }
  } catch (error) {
    toggleLoader(false);
    iziToast.error({
      title: 'Error',
      message: error.message,
    });
  }
});

loadMoreBtn.addEventListener('click', async () => {
  currentPage += 1;

  toggleLoader(true);

  try {
    const { hits } = await fetchImages(currentQuery, currentPage);
    toggleLoader(false);

    renderImages(hits);

    if (currentPage * 15 >= totalHits) {
      toggleLoadMoreButton(false);
      iziToast.info({
        title: 'End of results',
        message: "We're sorry, but you've reached the end of search results.",
      });
    } else {
      scrollToNextBatch();
    }
  } catch (error) {
    toggleLoader(false);
    iziToast.error({
      title: 'Error',
      message: error.message,
    });
  }
});

const scrollToNextBatch = () => {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
};
