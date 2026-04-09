import React from 'react';
import { MoneyClock } from './components/MoneyClock';
export function App() {
  return (
    <div
      className="w-full min-h-screen"
      style={{
        background:
        'linear-gradient(170deg, #4ade80 0%, #22c55e 30%, #16a34a 70%, #15803d 100%)'
      }}>
      
      <MoneyClock />
    </div>);

}