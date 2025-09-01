"use client";

import { Section, Block, Link } from "@/devlink/_Builtin";
import { Navbar } from "@/devlink/Navbar"; // Import the Navbar component
import { Footer } from "@/devlink/Footer"; // Import the Footer component

export default function Home() {
  return (
    <Section
      tag="section"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Block tag="div" className="container">
      {/* Add Nav Bar with props*/}
        <Navbar
          navbarLinkFeatures="Hello"
          navbarLinkProducts="Webflow"
          navbarLinkResources="Cloud"
          navbarLinkContact=""
        /> 
        <Block
          tag="div"
          className="hero-split"
          style={{
            textAlign: "center",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          <h1
            className="margin-bottom-24px"
            style={{
              fontSize: "2.5rem",
              fontWeight: 700,
              background: "linear-gradient(83.21deg, #3245ff 0%, #bc52ee 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Welcome to Webflow Cloud
          </h1>
          <Block tag="p" className="margin-bottom-24px">
            This is a simple test using Basic components with enhanced styling.
          </Block>
          <div>
            <Link
              button={true}
              options={{
                href: "#",
              }}
              className="button-primary"
            >
              Get Started
            </Link>
          </div>
        </Block>
        <Footer /> {/* Add Footer */}
      </Block>
    </Section>
  );
}

