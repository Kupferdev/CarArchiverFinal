import { useEffect, useState } from 'react';
import './App.css'

import { SetupWizard } from './setup/SetupWizard';
import './setup/setup.css'; // Global CSS dosyanı burada çağır
import HomePage from './components/HomePage';
import { useInitialConfig } from './hooks/useInitialConfig';

function App() {
  const { isFirstRun } = useInitialConfig();

  if (isFirstRun === null) return null;

  return isFirstRun ? <SetupWizard /> : <HomePage />;
}

export default App
