import React from 'react';
import ReactDOM from "react-dom/client";


import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router-dom";

import "@blueprintjs/core/lib/css/blueprint.css";

import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/datetime2/lib/css/blueprint-datetime2.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css"
import "@blueprintjs/select/lib/css/blueprint-select.css"
import "@blueprintjs/datetime/lib/css/blueprint-datetime.css"
import "@blueprintjs/table/lib/css/table.css"


import "react-grid-layout/css/styles.css"
import "react-resizable/css/styles.css"

import './index.css';

import App from './App';
import { QueryClientProvider, QueryClient } from "react-query"

const queryClient = new QueryClient();
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
    <App />
    </BrowserRouter>
    </QueryClientProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
