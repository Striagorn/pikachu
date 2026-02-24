'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Video } from "lucide-react"

interface VideoDialogProps {
  videoUrl: string
  title?: string
}

export function VideoDialog({ videoUrl, title }: VideoDialogProps) {
  
  const getEmbedUrl = (url: string) => {
    try {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.split('v=')[1] || url.split('/').pop()?.split('?')[0];
             // Handle potential params like &t=
            const cleanId = videoId?.split('&')[0];
            return `https://www.youtube.com/embed/${cleanId}?autoplay=0&rel=0`
        }
        if (url.includes('vimeo.com')) {
            const videoId = url.split('.com/')[1]?.split('/')[0];
            return `https://player.vimeo.com/video/${videoId}`
        }
    } catch (e) {
        console.error("Error parsing video URL", e)
    }
    return url 
  }

  const embedUrl = getEmbedUrl(videoUrl)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-100 text-blue-500 hover:text-blue-600">
           <Video className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-black border-slate-800">
        <DialogHeader className="sr-only">
          <DialogTitle>Video: {title || 'Demostración'}</DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full">
            <iframe 
                width="100%" 
                height="100%" 
                src={embedUrl} 
                title={title || "Video player"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="border-0"
            ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  )
}
