import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import ProtectedRoutes from "./routes/ProtectedRoutes.tsx";
import ErrorPage from "./pages/ErrorPage.tsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {AuthProvider} from "./context/AuthProvider.tsx";
import Root from "./layouts/Root.tsx";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {LoginPage} from "./pages/LoginPage.tsx";
import {RegisterPage} from "./pages/RegisterPage.tsx";
import SearchPage from "./pages/SearchPage.tsx";
import PhishingEventFormPage from "@/pages/PhishingEventFormPage.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <ProtectedRoutes layout={<Root/>}/>,
        errorElement: <ErrorPage/>,
        children: [
            {
                index: true,
                element: <SearchPage/>,
            },
            {
                path: "/phishing-add",
                element: <PhishingEventFormPage/>,
                errorElement: <ErrorPage/>,
            },
        ],
    },
    {
        path: "/login",
        element: <LoginPage/>,
        errorElement: <ErrorPage/>,
    },
    {
        path: "/register",
        element: <RegisterPage/>,
        errorElement: <ErrorPage/>,
    },
    // {
    //     path: "/search",
    //     element: <SearchPage/>,
    // },
    // {
    //     path: "/phishing-add",
    //     element: <PhishingEventFormPage/>,
    //     errorElement: <ErrorPage/>,
    // },
]);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <RouterProvider router={router}/>
            </AuthProvider>
            <ReactQueryDevtools initialIsOpen={false} buttonPosition="top-left"/>
        </QueryClientProvider>
    </React.StrictMode>,
);
