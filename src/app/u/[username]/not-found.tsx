// src/app/u/[username]/not-found.tsx
export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-2xl font-bold">Profile not found</h1>
      <p className="text-muted-foreground">This user does not exist or is private.</p>
    </div>
  );
}
