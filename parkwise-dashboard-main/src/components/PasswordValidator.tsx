import { Check, X } from "lucide-react";

interface PasswordValidatorProps {
  password: string;
}

export function PasswordValidator({ password }: PasswordValidatorProps) {
  const criteria = [
    { label: "8-25 characters long", met: password.length >= 8 && password.length <= 25 },
    { label: "At least one uppercase letter", met: /[A-Z]/.test(password) },
    { label: "At least one lowercase letter", met: /[a-z]/.test(password) },
    { label: "At least one number", met: /[0-9]/.test(password) },
    { label: "At least one special character", met: /[@#$%^&+=!*()_\-.\]\[{}|:;"'<>,?/~`]/.test(password) }
  ];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2 p-3 bg-muted/50 rounded-lg border border-border text-sm">
      <p className="font-medium text-foreground/80 mb-1">Password requirements:</p>
      {criteria.map((c, i) => (
        <div key={i} className="flex items-center gap-2">
          {c.met ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <X className="h-4 w-4 text-muted-foreground" />
          )}
          <span className={c.met ? "text-success" : "text-muted-foreground"}>
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
}
