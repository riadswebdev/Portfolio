import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Me",
  description:
    "Get in touch with Md. Riad Shekh. Reach out via email, phone, or send a direct message for project inquiries and collaboration.",
};

export default function ContactPage() {
  return <ContactClient />;
}