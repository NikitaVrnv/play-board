// src/pages/Profile.tsx
import { useAuth } from "@/context/AuthContext"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

const Profile = () => {
  const { user } = useAuth()

  if (!user) return <div className="p-6">You must be logged in to view your profile.</div>

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">My Profile</h1>
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.avatar || "/default-avatar.png"} />
          <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-lg font-medium">{user.username}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Role:</p>
        <p className="text-base font-medium capitalize">{user.role}</p>
      </div>
    </div>
  )
}

export default Profile
