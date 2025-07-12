// Import the endpoint constant from main.js and auth service
import { endpoint } from './main.js';
import authService from './auth.js';
import router from './router.js';

// DOM variables
const btnLogout = document.getElementById('btnLogout');
const btnAddPet = document.getElementById('btnAddPet');
const closeAddPetBtn = document.getElementById('closeAddPetBtn');
const cancelAddPetBtn = document.getElementById('cancelAddPetBtn');
const addPetForm = document.getElementById('addPetForm');

const closeEditPetBtn = document.getElementById('closeEditPetBtn');
const cancelEditPetBtn = document.getElementById('cancelEditPetBtn');
const editPetForm = document.getElementById('editPetForm');

const petsGrid = document.getElementById('petsGrid');
const totalPets = document.getElementById('totalPets');

const addPetModal = document.getElementById('addPetModal');
const editPetModal = document.getElementById('editPetModal');

let pets = [];

// Functions to show/hide modals
function showAddPetModal() {
  addPetModal.style.display = 'block';
}

function closeAddPetModal() {
  addPetModal.style.display = 'none';
  addPetForm.reset();
}

function showEditPetModal() {
  editPetModal.style.display = 'block';
}

function closeEditPetModal() {
  editPetModal.style.display = 'none';
  editPetForm.reset();
}

// Function to load pets from backend
async function loadPets() {
  try {
    const res = await fetch(`${endpoint}/pets`);
    if (!res.ok) throw new Error('Error loading pets');
    pets = await res.json();
    renderPets();
  } catch (error) {
    console.error(error);
    authService.showNotification('Error loading pets', 'error');
  }
}

// Function to render pets in DOM
function renderPets() {
  petsGrid.innerHTML = '';
  pets.forEach(pet => {
    const card = document.createElement('div');
    card.classList.add('pet-card');
    card.innerHTML = `
      <h4>${pet.name}</h4>
      <p>Age: ${pet.age}</p>
      <p>Breed: ${pet.breed}</p>
      <p>Owner: ${pet.owner}</p>
      <p>Type: ${pet.type}</p>
      <button class="btn btn-edit" data-id="${pet.id}">Edit</button>
      <button class="btn btn-delete" data-id="${pet.id}">Delete</button>
    `;
    petsGrid.appendChild(card);
  });

  totalPets.textContent = pets.length;

  // Add listeners to Edit and Delete buttons
  petsGrid.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const petId = e.target.dataset.id;
      openEditPet(petId);
    });
  });

  petsGrid.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const petId = e.target.dataset.id;
      if (confirm('Are you sure you want to delete this pet?')) {
        await deletePet(petId);
        await loadPets();
      }
    });
  });
}

// Open edit modal and load data
function openEditPet(id) {
  const pet = pets.find(p => p.id == id);
  if (!pet) return;

  document.getElementById('editPetId').value = pet.id;
  document.getElementById('editPetName').value = pet.name;
  document.getElementById('editPetAge').value = pet.age;
  document.getElementById('editPetBreed').value = pet.breed;
  document.getElementById('editPetOwner').value = pet.owner;
  document.getElementById('editPetType').value = pet.type;

  showEditPetModal();
}

// Create new pet (POST)
async function addPet(petData) {
  try {
    const res = await fetch(`${endpoint}/pets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(petData),
    });
    if (!res.ok) throw new Error('Error adding pet');
    authService.showNotification('Pet added successfully', 'success');
  } catch (error) {
    console.error(error);
    authService.showNotification('Error adding pet', 'error');
  }
}

// Update pet (PUT)
async function updatePet(id, petData) {
  try {
    const res = await fetch(`${endpoint}/pets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(petData),
    });
    if (!res.ok) throw new Error('Error updating pet');
    authService.showNotification('Pet updated successfully', 'success');
  } catch (error) {
    console.error(error);
    authService.showNotification('Error updating pet', 'error');
  }
}

// Delete pet (DELETE)
async function deletePet(id) {
  try {
    const res = await fetch(`${endpoint}/pets/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error deleting pet');
    authService.showNotification('Pet deleted successfully', 'success');
  } catch (error) {
    console.error(error);
    authService.showNotification('Error deleting pet', 'error');
  }
}

// Handle add pet form submission
addPetForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const petData = {
    name: addPetForm.petName.value.trim(),
    age: Number(addPetForm.petAge.value),
    breed: addPetForm.petBreed.value.trim(),
    owner: addPetForm.petOwner.value.trim(),
    type: addPetForm.petType.value.trim()
  };

  await addPet(petData);
  await loadPets();
  closeAddPetModal();
});

// Handle edit pet form submission
editPetForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const petId = editPetForm.editPetId.value;
  const petData = {
    name: editPetForm.editPetName.value.trim(),
    age: Number(editPetForm.editPetAge.value),
    breed: editPetForm.editPetBreed.value.trim(),
    owner: editPetForm.editPetOwner.value.trim(),
    type: editPetForm.editPetType.value.trim()
  };

  await updatePet(petId, petData);
  await loadPets();
  closeEditPetModal();
});

// Event listeners for modal buttons
btnAddPet.addEventListener('click', showAddPetModal);
closeAddPetBtn.addEventListener('click', closeAddPetModal);
cancelAddPetBtn.addEventListener('click', closeAddPetModal);

closeEditPetBtn.addEventListener('click', closeEditPetModal);
cancelEditPetBtn.addEventListener('click', closeEditPetModal);

// Close modals when clicking outside
window.addEventListener('click', (e) => {
  if (e.target === addPetModal) {
    closeAddPetModal();
  }
  if (e.target === editPetModal) {
    closeEditPetModal();
  }
});

// Load pets when page loads
document.addEventListener('DOMContentLoaded', () => {
  loadPets();
});
