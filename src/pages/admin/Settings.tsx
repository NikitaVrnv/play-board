// src/pages/admin/Settings.tsx
import { useState } from 'react'
import { toast } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { RefreshCw, Save } from 'lucide-react'

export default function Settings() {
  const [loading, setLoading] = useState(false)

  /* general */
  const [general, setGeneral] = useState({
    siteName: 'Games Review Platform',
    siteDescription: 'A platform for reviewing and discovering games',
    contactEmail: 'admin@gamesreview.com',
    itemsPerPage: '10',
    enableRegistration: true,
  })

  /* moderation */
  const [moderation, setModeration] = useState({
    autoApproveGames: false,
    autoApproveReviews: false,
    filterProfanity: true,
    notifyAdminOnNewSubmission: true,
    notifyUserOnModeration: true,
    requiredApprovals: '1',
  })

  /* save */
  const save = async () => {
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 800)) // mock
      console.log('Saving settings', { general, moderation })
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  /* helper setters */
  const setG = (f: keyof typeof general, v: any) =>
    setGeneral(p => ({ ...p, [f]: v }))
  const setM = (f: keyof typeof moderation, v: any) =>
    setModeration(p => ({ ...p, [f]: v }))

  /* ─────────── render ─────────── */
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Admin Settings</h1>
        <Button onClick={save} disabled={loading}>
          {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
        </TabsList>

        {/* general */}
        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>General</CardTitle>
              <CardDescription>Basic site info</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                ['Site Name',        'siteName',        'text'],
                ['Site Description', 'siteDescription', 'textarea'],
                ['Contact Email',    'contactEmail',    'email'],
              ].map(([lbl, key, type]) => (
                <div key={key as string} className="space-y-2">
                  <Label>{lbl}</Label>
                  {type === 'textarea' ? (
                    <Textarea
                      rows={3}
                      value={general[key as keyof typeof general] as string}
                      onChange={e => setG(key as any, e.target.value)}
                    />
                  ) : (
                    <Input
                      type={type as string}
                      value={general[key as keyof typeof general] as string}
                      onChange={e => setG(key as any, e.target.value)}
                    />
                  )}
                </div>
              ))}

              <div className="space-y-2">
                <Label>Items per page</Label>
                <Select
                  value={general.itemsPerPage}
                  onValueChange={v => setG('itemsPerPage', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 15, 20, 25, 50].map(n => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="reg"
                  checked={general.enableRegistration}
                  onCheckedChange={c => setG('enableRegistration', c === true)}
                />
                <label htmlFor="reg" className="text-sm">
                  Allow new user registrations
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* moderation */}
        <TabsContent value="moderation" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Moderation</CardTitle>
              <CardDescription>Content moderation rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                ['autoApproveGames',            'Auto-approve game submissions'],
                ['autoApproveReviews',          'Auto-approve reviews'],
                ['filterProfanity',             'Filter profanity'],
                ['notifyAdminOnNewSubmission',  'Notify admin on new submission'],
                ['notifyUserOnModeration',      'Notify user after moderation'],
              ].map(([key, lbl]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    checked={moderation[key as keyof typeof moderation] as boolean}
                    onCheckedChange={c => setM(key as any, c === true)}
                  />
                  <label className="text-sm">{lbl}</label>
                </div>
              ))}

              {/* approvals */}
              <div className="space-y-2">
                <Label>Required approvals before publish</Label>
                <Select
                  value={moderation.requiredApprovals}
                  onValueChange={v => setM('requiredApprovals', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3].map(n => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
