# Wall Calendar App

A React + Vite wall calendar experience inspired by a real hanging calendar design.

## Features

- Realistic wall-hanging calendar layout
- Month-wise hero image that updates when month changes
- 3D top-to-bottom page flip transition between months
- Year selector to jump directly to any year
- Date range selection with clear start, end, and in-range states
- Notes support for:
	- Monthly memo
	- Selected date range note
	- Selected day note
- Indian central holidays marked on the calendar
- Holiday reason display when a holiday date is clicked
- Responsive layout for desktop and mobile

## Responsive Design

The app is designed to work smoothly across laptop and mobile devices.

### Laptop / Desktop

- Preserves the wall-calendar composition with clear visual hierarchy
- Uses a spacious two-panel lower layout (notes + date grid)
- Keeps month navigation, range selection, and notes visible and easy to use
- Applies premium page-flip animation without breaking layout alignment

### Mobile

- Switches to a touch-friendly stacked layout
- Prevents clipping by allowing natural vertical flow on smaller screens
- Keeps date cells and controls sized for easier tapping
- Maintains full functionality for:
	- Date range selection
	- Day/range/month notes
	- Holiday highlighting and holiday reason display
	- Year switching and month navigation

## Tech Stack

- React
- Vite
- date-holidays
- ESLint

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer

## Getting Started

1. Open a terminal in the project folder.
2. Install dependencies.

	 npm install

3. Start the app in development mode.

	 npm run dev

4. Open the URL shown in terminal (usually http://localhost:5173).

## Available Scripts

- Run development server:

	npm run dev

- Build for production:

	npm run build

- Preview production build locally:

	npm run preview

- Run lint checks:

	npm run lint

## Project Structure

- src/App.jsx: Main calendar component and interaction logic
- src/App.css: Visual design, layout, animation, and responsive styles
- src/index.css: Global styles and viewport behavior

## Holiday Notes

- Holidays are currently configured for Indian central holidays.
- Holiday dates are shown with a dot marker.
- Clicking a holiday date shows its reason in the notes panel.

## Build Output

Running npm run build generates optimized static files in the dist folder.

## Troubleshooting

- If dependencies fail to install, delete node_modules and package-lock.json, then run npm install again.
- If port 5173 is busy, Vite will automatically suggest another port.
- If styles look outdated, hard refresh the browser to clear cached assets.
