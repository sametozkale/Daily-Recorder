"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

import { AppIcons, Icon } from "@/components/icon"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <Icon icon={AppIcons.checkCircle} size={14} />,
        info: <Icon icon={AppIcons.info} size={14} />,
        warning: <Icon icon={AppIcons.alert} size={14} />,
        error: <Icon icon={AppIcons.error} size={14} />,
        loading: (
          <Icon icon={AppIcons.loading} size={14} className="animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          "--width": "260px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
          title: "cn-toast-title",
          description: "cn-toast-description",
          icon: "cn-toast-icon",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
