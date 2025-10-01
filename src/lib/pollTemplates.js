export const pollTemplates = [
  {
    id: 'yes-no',
    name: 'Yes/No Question',
    icon: '✅',
    category: 'GENERAL',
    title: 'Should we...?',
    options: ['Yes', 'No']
  },
  {
    id: 'rating-1-5',
    name: 'Rating (1-5 Stars)',
    icon: '⭐',
    category: 'GENERAL',
    title: 'How would you rate...?',
    options: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars']
  },
  {
    id: 'satisfaction',
    name: 'Customer Satisfaction',
    icon: '😊',
    category: 'BUSINESS',
    title: 'How satisfied are you with our service?',
    options: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied']
  },
  {
    id: 'priority',
    name: 'Priority Level',
    icon: '🎯',
    category: 'BUSINESS',
    title: 'What is your priority level for...?',
    options: ['Low Priority', 'Medium Priority', 'High Priority', 'Critical']
  },
  {
    id: 'multiple-choice',
    name: 'Multiple Choice',
    icon: '📝',
    category: 'GENERAL',
    title: 'Which option do you prefer?',
    options: ['Option A', 'Option B', 'Option C', 'Option D']
  },
  {
    id: 'sports-team',
    name: 'Favorite Sports Team',
    icon: '⚽',
    category: 'SPORTS',
    title: 'Which team do you support?',
    options: ['Team A', 'Team B', 'Team C', 'Other']
  },
  {
    id: 'movie-genre',
    name: 'Favorite Movie Genre',
    icon: '🎬',
    category: 'ENTERTAINMENT',
    title: 'What\'s your favorite movie genre?',
    options: ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi']
  },
  {
    id: 'food-preference',
    name: 'Food Preference',
    icon: '🍕',
    category: 'FOOD',
    title: 'What\'s your favorite cuisine?',
    options: ['Italian', 'Chinese', 'Mexican', 'Indian', 'American', 'Other']
  },
  {
    id: 'travel-destination',
    name: 'Travel Destination',
    icon: '✈️',
    category: 'TRAVEL',
    title: 'Where would you like to travel next?',
    options: ['Beach', 'Mountains', 'City', 'Countryside', 'International']
  },
  {
    id: 'technology-choice',
    name: 'Technology Choice',
    icon: '💻',
    category: 'TECHNOLOGY',
    title: 'Which technology do you prefer?',
    options: ['iOS', 'Android', 'Windows', 'macOS', 'Linux']
  },
  {
    id: 'education-level',
    name: 'Education Level',
    icon: '📚',
    category: 'EDUCATION',
    title: 'What is your highest education level?',
    options: ['High School', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'Doctorate', 'Other']
  },
  {
    id: 'health-rating',
    name: 'Health & Wellness',
    icon: '🏥',
    category: 'HEALTH',
    title: 'How do you rate your overall health?',
    options: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
  }
]

export const getTemplateById = (id) => {
  return pollTemplates.find(template => template.id === id)
}