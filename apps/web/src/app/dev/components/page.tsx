"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Bilingual } from "@/components/ui/bilingual"
import { ProductIconBlock } from "@/components/ui/product-icon-block"
import { EmptyState } from "@/components/ui/empty-state"
import { ToastContainer, ToastItem } from "@/components/ui/toast"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerList } from "@/components/motion/stagger-list"
import { SkeletonBlock } from "@/components/motion/skeleton-block"
import { ShoppingBag, Search, Bell, Package, BookOpen, PenTool } from "lucide-react"

export default function ComponentShowcasePage() {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  const addToast = (variant: "success" | "error" | "info") => {
    const id = Date.now().toString()
    const newToast: ToastItem = {
      id,
      variant,
      title: `${variant.toUpperCase()} Notification`,
      description: `This is a sample ${variant} toast notification message.`,
    }
    setToasts((prev) => [...prev, newToast])
  }

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] p-8 text-[var(--color-ink-900)]">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Header */}
        <header className="border-b border-border pb-6">
          <Badge variant="evergreen" className="mb-2">Dev Showcase</Badge>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Phase 1: Core Component Library</h1>
          <p className="mt-1 text-muted-foreground">
            Visual inspection and interactive showcase for all Phase 1 primitives.
          </p>
        </header>

        {/* 1. Buttons & Inputs */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl font-semibold border-b border-border pb-2">
            1. Buttons & Inputs
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="default">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="destructive">Destructive</Button>
            <Button size="icon" variant="outline"><ShoppingBag className="size-4" /></Button>
          </div>
          <div className="max-w-sm pt-2">
            <Input placeholder="Search stationers catalogue..." />
          </div>
        </section>

        {/* 2. Badges & Color System */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl font-semibold border-b border-border pb-2">
            2. Badges & Color Palette
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="evergreen">Evergreen</Badge>
            <Badge variant="amber">Amber</Badge>
            <Badge variant="mist">Mist</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </section>

        {/* 3. Bilingual Labels (FR-LNG-01) */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl font-semibold border-b border-border pb-2">
            3. Bilingual English + Urdu Labels (FR-LNG-01)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Stacked (Default)</CardTitle>
              </CardHeader>
              <CardContent>
                <Bilingual en="Raza Stationers" ur="رضا اسٹیشنرز" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Inline Layout</CardTitle>
              </CardHeader>
              <CardContent>
                <Bilingual en="Add to Cart" ur="ٹوکری میں شامل کریں" layout="inline" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Reverse Stacked</CardTitle>
              </CardHeader>
              <CardContent>
                <Bilingual en="Wholesale Account" ur="تھوک کھاتہ" layout="reverse-stacked" />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 4. Product Icon Blocks (FR-CAT-01) */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl font-semibold border-b border-border pb-2">
            4. Product Icon Blocks (FR-CAT-01 No Photography)
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="text-center">
              <ProductIconBlock category="paper" size="md" className="mb-2" />
              <span className="text-xs font-medium">Paper Products</span>
            </div>
            <div className="text-center">
              <ProductIconBlock category="pens" size="md" className="mb-2" />
              <span className="text-xs font-medium">Pens & Ink</span>
            </div>
            <div className="text-center">
              <ProductIconBlock category="files" size="md" className="mb-2" />
              <span className="text-xs font-medium">Files & Folders</span>
            </div>
            <div className="text-center">
              <ProductIconBlock category="cutting" size="md" className="mb-2" />
              <span className="text-xs font-medium">Cutting Tools</span>
            </div>
            <div className="text-center">
              <ProductIconBlock category="office" size="md" className="mb-2" />
              <span className="text-xs font-medium">Office Supplies</span>
            </div>
          </div>
        </section>

        {/* 5. Tabs, Dialogs & Drawers */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl font-semibold border-b border-border pb-2">
            5. Tabs, Dialog & Sheet (Drawer)
          </h2>
          <div className="space-y-4">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="pricing">Wholesale Pricing</TabsTrigger>
                <TabsTrigger value="stock">Live Stock</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="p-4 border rounded-lg bg-card mt-2">
                Overview Content — Raza Stationers core catalogue system.
              </TabsContent>
              <TabsContent value="pricing" className="p-4 border rounded-lg bg-card mt-2">
                Wholesale Pricing Content — Tiered pricing available to approved business clients.
              </TabsContent>
              <TabsContent value="stock" className="p-4 border rounded-lg bg-card mt-2">
                Live Stock Content — Real-time inventory status per warehouse unit.
              </TabsContent>
            </Tabs>

            <div className="flex gap-3">
              <Button onClick={() => setDialogOpen(true)} variant="outline">
                Open Dialog Modal
              </Button>
              <Button onClick={() => setSheetOpen(true)} variant="outline">
                Open Sheet Drawer
              </Button>
            </div>
          </div>
        </section>

        {/* 6. Empty State & Toast Feedback */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl font-semibold border-b border-border pb-2">
            6. Empty State & Toast Notifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EmptyState
              title="Your Cart is Empty"
              description="Explore our wholesale catalogue to add stationery items to your order."
              actionLabel="Browse Catalogue"
              onAction={() => alert("Browse clicked!")}
            />

            <div className="flex flex-col justify-center gap-3 border p-6 rounded-xl bg-card">
              <h4 className="font-semibold text-sm">Trigger Toast Notifications:</h4>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="default" onClick={() => addToast("success")}>
                  Success Toast
                </Button>
                <Button size="sm" variant="destructive" onClick={() => addToast("error")}>
                  Error Toast
                </Button>
                <Button size="sm" variant="outline" onClick={() => addToast("info")}>
                  Info Toast
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Motion & Skeleton Wrappers */}
        <section className="space-y-4">
          <h2 className="font-heading text-xl font-semibold border-b border-border pb-2">
            7. Motion Wrappers & Skeletons (Reduced Motion Safe)
          </h2>
          <FadeIn>
            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-2">FadeIn Entrance Wrapper</h4>
              <p className="text-xs text-muted-foreground">
                This element renders smoothly with accessibility fallback under reduced motion settings.
              </p>
            </Card>
          </FadeIn>

          <StaggerList className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1, 2, 3].map((num) => (
              <Card key={num} className="p-4">
                <div className="font-semibold text-xs mb-1">Stagger Item #{num}</div>
                <div className="text-xs text-muted-foreground">Capped stagger entrance timing (&lt;300ms total).</div>
              </Card>
            ))}
          </StaggerList>

          <div className="space-y-2 pt-2">
            <h4 className="font-semibold text-sm">Skeleton Loading Blocks:</h4>
            <div className="flex items-center gap-3">
              <SkeletonBlock height={40} width={40} className="rounded-full" />
              <div className="space-y-1.5 flex-1">
                <SkeletonBlock height={14} width="60%" />
                <SkeletonBlock height={12} width="40%" />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Interactive Overlay Instances */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogClose onClick={() => setDialogOpen(false)} />
        <DialogHeader>
          <DialogTitle>Sample Dialog Title</DialogTitle>
          <DialogDescription>
            This is a reusable modal dialog built with Framer Motion transitions and focus management.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="default" onClick={() => setDialogOpen(false)}>Confirm</Button>
        </DialogFooter>
      </Dialog>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen} side="right">
        <SheetClose onClick={() => setSheetOpen(false)} />
        <SheetHeader>
          <SheetTitle>Side Drawer (Sheet)</SheetTitle>
          <SheetDescription>
            Used for mobile navigation and slide-over panels.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6 flex-1 text-sm text-muted-foreground">
          Drawer content body...
        </div>
      </Sheet>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
