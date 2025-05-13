export const metadata = {
  title: "Profile | BluBerry",
  description: "Manage your profile and account settings",
}

export default function ProfilePage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

      <div className="grid gap-6">{/* Other profile sections can be added here */}</div>
    </div>
  )
}
