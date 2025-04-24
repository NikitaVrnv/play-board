// src/components/AddGameForm.tsx
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { API } from "@/services/api"
import { Genre, User } from "../types"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "@/components/ui/sonner"

const gameSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }).max(100),
  author: z.string().min(2, { message: "Author must be at least 2 characters" }).max(100),
  genre: z.string().min(1, { message: "Please select a genre" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" })
    .max(2000),
  coverImage: z.string().url({ message: "Please enter a valid URL" }),
  releaseDate: z.string().optional(),
})

type GameFormValues = z.infer<typeof gameSchema>

const AddGameForm = () => {
  const [genres, setGenres] = useState<Genre[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const list = await API.getGenres()
        setGenres(list)
      } catch {
        toast.error("Failed to load genres", {
          description: "Could not fetch genre list, please refresh.",
        })
      }
    }
    loadGenres()
  }, [])

  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameSchema),
    defaultValues: {
      title: "",
      author: "",
      genre: "",
      description: "",
      coverImage: "",
      releaseDate: "",
    },
  })

  const onSubmit = async (values: GameFormValues) => {
    try {
      const newGame = await API.addGame({
        title: values.title,
        createdBy : values.author as unknown as User,
        genre: values.genre as Genre,
        description: values.description,
        coverImage: values.coverImage,
        releaseDate: values.releaseDate,
      })
      toast.success("Game added", {
        description: `${newGame.title} has been successfully added!`,
      })
      navigate(`/games/${newGame.id}`)
    } catch {
      toast.error("Error", {
        description: "Failed to add the game. Please try again.",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter game title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Developer/Publisher</FormLabel>
                <FormControl>
                  <Input placeholder="Enter developer or publisher" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="genre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Genre</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter game description"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="coverImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="Enter image URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="releaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Release Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/")}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Add Game
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default AddGameForm
