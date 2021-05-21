import React from 'react'
import logo from './react.svg'

function Home() {
  return (
    <div className="flex flex-col min-h-screen gap-8">
      <div className="flex flex-row justify-around w-full p-8 bg-gray-800 bgp-circuitBoard-.5-gray-600 gap-8 align-center">
        <div className="flex flex-col gap-8">
          <img src={logo} className="h-48 animate-spin-xslow" alt="logo" />
          <h2 className="text-4xl font-extrabold text-gray-50">Welcome to Razzle</h2>
        </div>
      </div>
      <div className="px-8 prose">
        <p>
          To get started, edit <code>src/App.tsx</code> or{' '}
          <code>src/Home.tsx</code> and save to reload.
        </p>
        <ul>
          <li>
            <a href="https://github.com/jaredpalmer/razzle">Docs</a>
          </li>
          <li>
            <a href="https://github.com/jaredpalmer/razzle/issues">Issues</a>
          </li>
          <li>
            <a href="https://palmer.chat">Community Slack</a>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Home
