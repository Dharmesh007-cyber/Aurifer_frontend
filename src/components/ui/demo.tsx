import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export default function Example() {
  return (
    <div className="flex items-center justify-center p-10">
      <form className="w-full max-w-3xl space-y-6">
        <div>
          <h2 className="font-semibold text-foreground">Create workspace</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Demo companion form for the integrated layout component.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="first-name">First name</Label>
            <Input id="first-name" className="mt-2" />
          </div>
          <div>
            <Label htmlFor="last-name">Last name</Label>
            <Input id="last-name" className="mt-2" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" className="mt-2" rows={4} />
          </div>
        </div>
        <Separator />
        <div className="flex justify-end">
          <Button type="submit">Save settings</Button>
        </div>
      </form>
    </div>
  );
}

