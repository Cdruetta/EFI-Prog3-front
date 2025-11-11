import { Fragment } from "react";
import AppNavbar from "./Navbar";

export default function Layout({ children }) {
    return (
        <Fragment>
            <AppNavbar />
            <main style={{ minHeight: "calc(100vh - 200px)", width: "100%" }}>
                {children}
            </main>
        </Fragment>
    );
}

