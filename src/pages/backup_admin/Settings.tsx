// src/pages/admin/Settings.tsx
import { useState } from "react"
import { toast } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { RefreshCw, Save } from "lucide-react"

export default function Settings() {
  const [isLoading, setIsLoading] = useState(false)
  
  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Games Review Platform",
    siteDescription: "A platform for reviewing and discovering games",
    contactEmail: "admin@gamesreview.com",
    itemsPerPage: "10",
    enableRegistration: true,
  })
  
  // Moderation settings
  const [moderationSettings, setModerationSettings] = useState({
    autoApproveGames: false,
    autoApproveReviews: false,
    filterProfanity: true,
    notifyAdminOnNewSubmission: true,
    notifyUserOnModeration: true,
    requiredApprovals: "1",
  })
  
  const handleGeneralChange = (field: string, value: string | boolean) => {
    setGeneralSettings(prev => ({ ...prev, [field]: value }))
  }
  
  const handleModerationChange = (field: string, value: string | boolean) => {
    setModerationSettings(prev => ({ ...prev, [field]: value }))
  }
  
  const saveSettings = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Combine all settings
      const settings = {
        general: generalSettings,
        moderation: moderationSettings,
      }
      
      // In a real app, you would save these to your API
      console.log('Saving settings:', settings)
      
      toast.success("Settings saved successfully")
    } catch (error) {
      toast.error("Failed to save settings")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Admin Settings</h1>
        <Button 
          onClick={saveSettings} 
          disabled={isLoading}
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage basic site settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Site Name</Label>
                <Input 
                  id="site-name" 
                  value={generalSettings.siteName} 
                  onChange={(e) => handleGeneralChange('siteName', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site-description">Site Description</Label>
                <Textarea 
                  id="site-description" 
                  rows={3}
                  value={generalSettings.siteDescription} 
                  onChange={(e) => handleGeneralChange('siteDescription', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input 
                  id="contact-email" 
                  type="email"
                  value={generalSettings.contactEmail} 
                  onChange={(e) => handleGeneralChange('contactEmail', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="items-per-page">Items Per Page</Label>
                <Select 
                  value={generalSettings.itemsPerPage}
                  onValueChange={(value) => handleGeneralChange('itemsPerPage', value)}
                >
                  <SelectTrigger id="items-per-page">
                    <SelectValue placeholder="Select items per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 items</SelectItem>
                    <SelectItem value="10">10 items</SelectItem>
                    <SelectItem value="15">15 items</SelectItem>
                    <SelectItem value="20">20 items</SelectItem>
                    <SelectItem value="25">25 items</SelectItem>
                    <SelectItem value="50">50 items</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="enable-registration" 
                  checked={generalSettings.enableRegistration} 
                  onCheckedChange={(checked) => handleGeneralChange('enableRegistration', checked === true)}
                />
                <label
                  htmlFor="enable-registration"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Allow new user registrations
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="moderation" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Settings</CardTitle>
              <CardDescription>Configure content moderation options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="auto-approve-games" 
                  checked={moderationSettings.autoApproveGames} 
                  onCheckedChange={(checked) => handleModerationChange('autoApproveGames', checked === true)}
                />
                <label
                  htmlFor="auto-approve-games"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Auto-approve game submissions
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="auto-approve-reviews" 
                  checked={moderationSettings.autoApproveReviews} 
                  onCheckedChange={(checked) => handleModerationChange('autoApproveReviews', checked === true)}
                />
                <label
                  htmlFor="auto-approve-reviews"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Auto-approve reviews
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="filter-profanity" 
                  checked={moderationSettings.filterProfanity} 
                  onCheckedChange={(checked) => handleModerationChange('filterProfanity', checked === true)}
                />
                <label
                  htmlFor="filter-profanity"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Filter profanity in reviews and comments
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="notify-admin" 
                  checked={moderationSettings.notifyAdminOnNewSubmission} 
                  onCheckedChange={(checked) => handleModerationChange('notifyAdminOnNewSubmission', checked === true)}
                />
                <label
                  htmlFor="notify-admin"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Notify admins on new submissions
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="notify-user" 
                  checked={moderationSettings.notifyUserOnModeration} 
                  onCheckedChange={(checked) => handleModerationChange('notifyUserOnModeration', checked === true)}
                />
                <label
                  htmlFor="notify-user"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Notify users when content is moderated
                </label>
              </div>
              
              <div className="space-y-2 pt-2">
                <Label htmlFor="required-approvals">Required Approvals</Label>
                <Select 
                  value={moderationSettings.requiredApprovals}
                  onValueChange={(value) => handleModerationChange('requiredApprovals', value)}
                >
                  <SelectTrigger id="required-approvals">
                    <SelectValue placeholder="Select required approvals" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 approval</SelectItem>
                    <SelectItem value="2">2 approvals</SelectItem>
                    <SelectItem value="3">3 approvals</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Number of moderator approvals required before content is published
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}