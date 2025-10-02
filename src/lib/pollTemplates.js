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
  },
  {
    id: 'weekend-plans',
    name: 'Weekend Plans',
    icon: '🎉',
    category: 'GENERAL',
    title: 'What are your plans for the weekend?',
    options: ['Stay home and relax', 'Go out with friends', 'Travel somewhere', 'Work on projects', 'Family time']
  },
  {
    id: 'remote-work',
    name: 'Remote Work Preference',
    icon: '🏠',
    category: 'BUSINESS',
    title: 'Do you prefer working remotely?',
    options: ['Always remote', 'Hybrid (some days office)', 'Mostly office-based', 'Depends on the task']
  },
  {
    id: 'social-media',
    name: 'Social Media Platform',
    icon: '📱',
    category: 'TECHNOLOGY',
    title: 'Which social media platform do you use most?',
    options: ['Facebook', 'Instagram', 'Twitter/X', 'TikTok', 'LinkedIn', 'YouTube']
  },
  {
    id: 'coffee-tea',
    name: 'Coffee vs Tea',
    icon: '☕',
    category: 'FOOD',
    title: 'Coffee or tea?',
    options: ['Coffee', 'Tea', 'Both', 'Neither']
  },
  {
    id: 'morning-person',
    name: 'Morning Person',
    icon: '🌅',
    category: 'GENERAL',
    title: 'Are you a morning person?',
    options: ['Definitely a morning person', 'Somewhat', 'Not really', 'Night owl']
  },
  {
    id: 'pet-preference',
    name: 'Pet Preference',
    icon: '🐕',
    category: 'GENERAL',
    title: 'Which pet would you choose?',
    options: ['Dog', 'Cat', 'Bird', 'Fish', 'Reptile', 'No pets']
  },
  {
    id: 'music-genre',
    name: 'Music Genre',
    icon: '🎵',
    category: 'ENTERTAINMENT',
    title: 'What\'s your favorite music genre?',
    options: ['Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'Country']
  },
  {
    id: 'exercise-frequency',
    name: 'Exercise Frequency',
    icon: '💪',
    category: 'HEALTH',
    title: 'How often do you exercise?',
    options: ['Daily', '3-4 times a week', '1-2 times a week', 'Rarely', 'Never']
  },
  {
    id: 'learning-style',
    name: 'Learning Style',
    icon: '🎓',
    category: 'EDUCATION',
    title: 'What\'s your preferred learning style?',
    options: ['Visual (videos/images)', 'Auditory (podcasts/audio)', 'Reading/Writing', 'Hands-on/Practical', 'Discussion/Groups']
  }
]

export const getTemplateById = (id) => {
  return pollTemplates.find(template => template.id === id)
}