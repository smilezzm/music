/**
 * Global configuration for the Mini Program
 */

module.exports = {
  // Admin OpenIDs - add authorized admin OpenIDs to this array
  // e.g. ['oXXXX-admin1', 'oXXXX-admin2']
  ADMIN_OPENIDS: [],

  // Cloud environment ID
  CLOUD_ENV: 'music-9gy2669z5c5fce6a',

  // Database collection names
  COLLECTIONS: {
    ACTIVITIES: 'activities',
    REGISTRATIONS: 'registrations',
    FAVORITES: 'favorites',
    USERS: 'users'
  },

  // Activity status constants
  ACTIVITY_STATUS: {
    UPCOMING: 'upcoming',
    ONGOING: 'ongoing',
    ENDED: 'ended'
  },

  // Default page size for paginated queries
  PAGE_SIZE: 10,

  // Default avatar image path
  DEFAULT_AVATAR: '/images/avatar.png'
}
