# Community Chat Platform

A modern, real-time chat application built with Angular 18 and CometChat SDK, featuring a sleek UI with light/dark theme support.

## Features

- 🎨 Modern UI with light/dark theme support
- 💬 Real-time messaging with CometChat integration
- 👥 User and group conversations
- 🔗 Threaded replies
- 📱 Fully responsive design
- 🎯 Message reactions and interactions
- 📎 File and media sharing support
- 🔍 User search and discovery

## Prerequisites

- Node.js (v18 or higher)
- Angular CLI (v18.2.20)
- CometChat account and credentials

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
```


## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Production build
```bash
ng build --configuration production
```

## Key Components

- **Home Component**: Main chat interface with conversation list
- **Message List**: Displays chat messages with infinite scroll
- **Message Composer**: Rich text input for sending messages
- **Thread Replies**: Nested conversation view
- **User/Group Lists**: Browse and select conversations

## Themes

The application supports light and dark themes. Toggle between themes using the theme selector in the UI. Theme preferences are stored in localStorage.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Technologies Used

- **Angular 18** - Frontend framework
- **CometChat SDK** - Real-time messaging
- **TypeScript** - Programming language
- **CSS3** - Styling with CSS variables for theming
- **RxJS** - Reactive programming


## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.