// src/utils/dateUtils.ts

/**
 * Formats a date string into a human-readable format without time component
 * @param dateString - The date string to format (ISO format or other valid date format)
 * @returns Formatted date string (e.g., "April 15, 2023")
 */
export function formatDate(dateString: string | undefined): string {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      
      // Format the date in a human-readable way
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date error";
    }
  }
  
  /**
   * Formats a timestamp into a relative time format (e.g., "2 days ago")
   * @param dateString - The date string to format
   * @returns Relative time string
   */
  export function formatRelativeTime(dateString: string | undefined): string {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      // Less than a minute
      if (diffInSeconds < 60) {
        return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
      }
      
      // Less than an hour
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
      }
      
      // Less than a day
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
      }
      
      // Less than a week
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
      }
      
      // Less than a month
      if (diffInDays < 30) {
        const diffInWeeks = Math.floor(diffInDays / 7);
        return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
      }
      
      // Less than a year
      if (diffInDays < 365) {
        const diffInMonths = Math.floor(diffInDays / 30);
        return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
      }
      
      // More than a year
      const diffInYears = Math.floor(diffInDays / 365);
      return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
    } catch (error) {
      console.error("Error formatting relative time:", error);
      return "Date error";
    }
  }