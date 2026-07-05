import { GithubIcon } from "@/components/common/github-icon";
import { LinkedInIcon } from "@/components/common/linkedin-icon";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background/50 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row">
        <p className="text-xs font-medium text-muted-foreground text-center sm:text-left">
          © {new Date().getFullYear()} PostScheduler · Built with n8n + Gemini +
          Pollinations.ai
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <p className="text-xs font-medium text-muted-foreground">
            Built by Ahsan Allaj
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/allajahzan/post-scheduler-linkedin"
              target="_blank"
              rel="noreferrer"
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub Profile"
            >
              <GithubIcon className="size-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/ahsanallajpk/"
              target="_blank"
              rel="noreferrer"
              className="p-1 text-muted-foreground hover:text-foreground  transition-colors"
              aria-label="LinkedIn Profile"
            >
              <LinkedInIcon className="size-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
