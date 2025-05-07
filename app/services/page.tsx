import Link from "next/link"

export default function ServicesPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="page-header mb-6">Our Services</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-3">Web Development</h2>
          <p>We create beautiful, responsive websites tailored to your needs.</p>
        </div>
        <div className="border p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-3">Mobile Apps</h2>
          <p>Custom mobile applications for iOS and Android platforms.</p>
        </div>
        <div className="border p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-3">UI/UX Design</h2>
          <p>User-centered design that enhances the user experience.</p>
        </div>
        <div className="border p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-3">Consulting</h2>
          <p>Expert advice on technology solutions for your business.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Back to Home
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          Contact Us
        </Link>
      </div>
    </div>
  )
}
