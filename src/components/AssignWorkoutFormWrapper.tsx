'use client'

import { useState } from "react"
import { AssignWorkoutForm } from "@/components/AssignWorkoutForm"

export function AssignWorkoutFormWrapper({ clientId, workouts }: { clientId: string, workouts: any[] }) {
    const [open, setOpen] = useState(true) // We rely on parent Dialog open state, but we need to close it.
    // Actually, shadcn Dialog content is rendered when open. 
    // To close it from child, we usually need control over the Dialog open state.
    // Since we are inside a server component that renders the Dialog, we can't easily control the parent state
    // unless the WHOLE Dialog is a client component.
    
    // Simplification: We will just render the form. The user has to close the dialog manually or we use a ref to the trigger?
    // Proper way: Make the "AssignButtonAndDialog" a client component.
    
    return <AssignWorkoutForm clientId={clientId} workouts={workouts} onClose={() => {
        // Close the dialog by finding the close button or programmatically
        // This is a bit hacky but works for Server Component parent patterns without context
        const closeBtn = document.querySelector('button[aria-label="Close"]') as HTMLButtonElement | null;
        if (closeBtn) closeBtn.click();
        
        // Fallback: If we can't find it, we just refresh which might re-render close? No.
        // Ideally we would move the Dialog State to this component.
    }} />
}
