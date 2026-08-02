import { forwardRef, type CSSProperties } from "react"
import { AppIcons, Icon } from "@/components/icon"
import { cn } from "@/lib/utils"
import { CompanyIcon } from "./company-icon"
import {
  getLifelineEventEffect,
  getLifelineEventImage,
  getLifelineEventKey,
  LifelineEventText,
} from "./lifeline-event"
import { useLifelineFireworks } from "./lifeline-fireworks"
import { useLifelineHoverImage } from "./lifeline-hover-image"
import {
  isIsoDateId,
  useLifelineInteraction,
} from "./lifeline-interaction"
import { aggregateLifelinePeople, LifelinePeople } from "./lifeline-people"
import {
  getProviderPhotos,
  ProviderCardStack,
} from "./provider-card-stack"
import type { LifelineMarker } from "./types"

interface LifelineMarkerColumnProps {
  marker: LifelineMarker
  birthYear: number
  minWidth: number
  animateIntro?: boolean
  introDelay?: number
  introDuration?: number
}

export const LifelineMarkerColumn = forwardRef<
  HTMLDivElement,
  LifelineMarkerColumnProps
>(function LifelineMarkerColumn(
  {
    marker,
    birthYear,
    minWidth,
    animateIntro = false,
    introDelay = 0,
    introDuration = 420,
  },
  ref,
) {
  const age = marker.age ?? marker.year - birthYear
  const people = aggregateLifelinePeople(marker)
  const hoverImage = useLifelineHoverImage()
  const fireworks = useLifelineFireworks()
  const interaction = useLifelineInteraction()
  const canSelectDay =
    Boolean(interaction?.onDaySelect) && isIsoDateId(marker.id)
  const providerPhotos = getProviderPhotos(marker.photos)

  return (
    <div
      ref={ref}
      className="group relative shrink-0 pr-8 transition-opacity duration-300 ease-out will-change-opacity"
      style={{ width: minWidth }}
      aria-label={marker.label ?? `${marker.year}`}
      data-lifeline-day={canSelectDay ? marker.id : undefined}
    >
      <div
        className={cn("relative", animateIntro && "lifeline-marker-intro")}
        style={{
          animationDelay: animateIntro ? `${introDelay}ms` : undefined,
          ...(animateIntro
            ? ({
                "--lifeline-marker-fade-ms": `${introDuration}ms`,
              } as CSSProperties)
            : {}),
        }}
      >
        <span
          className="absolute left-0 top-[var(--lifeline-rail)] z-10 h-[10px] w-px -translate-y-1/2 bg-zinc-400 transition-colors duration-300 group-hover:bg-zinc-600 dark:bg-zinc-700 dark:group-hover:bg-zinc-400"
          aria-hidden="true"
        />

        <div className="flex w-full flex-col items-start text-left">
          {age !== "" && age !== undefined ? (
            <p className="mb-5 h-4 text-[11px] font-medium leading-4 tabular-nums text-zinc-500 transition-colors duration-300 group-hover:text-black dark:text-zinc-600 dark:group-hover:text-zinc-400">
              {age}
            </p>
          ) : (
            <div className="mb-5 h-4" aria-hidden="true" />
          )}

          {canSelectDay ? (
            <button
              type="button"
              onClick={() => interaction?.onDaySelect?.(marker.id)}
              className="mb-6 h-5 whitespace-nowrap text-[15px] font-medium leading-5 tabular-nums text-zinc-500 transition-colors duration-300 hover:text-black group-hover:text-black dark:hover:text-white dark:group-hover:text-white"
            >
              {marker.label ?? marker.year}
            </button>
          ) : (
            <p className="mb-6 h-5 whitespace-nowrap text-[15px] font-medium leading-5 tabular-nums text-zinc-500 transition-colors duration-300 group-hover:text-black dark:group-hover:text-white">
              {marker.label ?? marker.year}
            </p>
          )}

          <div className="relative w-full pb-10 text-zinc-500 transition-colors duration-300 group-hover:text-black dark:group-hover:text-zinc-300">
            {/* When this column carries people, the content block reserves
                the band's height as a floor: short and average columns put
                their portraits on the same line as every other column, and
                a column whose events run past the floor pushes its own
                portraits below them instead of under them. pb-6 is the gap
                in the overflow case — absorbed by the floor otherwise. */}
            <div
              className={cn(
                "flex w-full flex-col items-start pt-6",
                people.length > 0 &&
                  "min-h-[var(--lifeline-people-top)] pb-6",
              )}
            >
              {providerPhotos.length > 0 ? (
                <ProviderCardStack photos={providerPhotos} />
              ) : null}

              {marker.companies && marker.companies.length > 0 && (
                <div className="mb-2 flex items-center justify-start gap-1.5">
                  {marker.companies.map((company) => (
                    <CompanyIcon
                      key={company.id}
                      id={company.id}
                      label={company.name}
                      className="opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                    />
                  ))}
                </div>
              )}

              <div className="space-y-4">
                {marker.events.map((event, index) => {
                  const image = getLifelineEventImage(event)
                  const effect = getLifelineEventEffect(event)

                  return (
                    <p
                      key={getLifelineEventKey(event, index)}
                      className={cn(
                        "max-w-[18rem] text-left text-[14px] leading-[1.55] tracking-[-0.01em]",
                        effect && "cursor-pointer",
                      )}
                      data-lifeline-interactive={effect ? "" : undefined}
                      onMouseEnter={
                        image && hoverImage
                          ? () => hoverImage.show(image)
                          : undefined
                      }
                      onMouseLeave={
                        image && hoverImage ? hoverImage.hide : undefined
                      }
                      onClick={
                        effect && fireworks
                          ? () => fireworks.launch(effect)
                          : undefined
                      }
                    >
                      <LifelineEventText event={event} />
                      {image && (
                        // Glued to the last word with a no-break space so
                        // the icon can never wrap onto a line of its own.
                        <span className="whitespace-nowrap">
                          {" "}
                          <span className="ml-0.5 inline-block -translate-y-px text-zinc-400 transition-colors duration-300 dark:text-zinc-600">
                            <Icon
                              icon={image.video ? AppIcons.film : AppIcons.image}
                              size={12}
                            />
                          </span>
                        </span>
                      )}
                    </p>
                  )
                })}
              </div>

              {canSelectDay ? (
                <button
                  type="button"
                  onClick={() => interaction?.onDaySelect?.(marker.id)}
                  aria-label={`Add activity on ${marker.label ?? marker.year}`}
                  className={cn(
                    "z-20 flex size-7 items-center justify-center rounded-full",
                    "bg-zinc-100 text-zinc-500 opacity-0 transition-[opacity,color,background-color] duration-300",
                    "group-hover:opacity-100 hover:bg-zinc-200 hover:text-black",
                    "dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white",
                    marker.events.length > 0 ? "mt-4" : "mt-0",
                  )}
                >
                  <Icon icon={AppIcons.plus} size={14} />
                </button>
              ) : null}
            </div>

            {people.length > 0 && (
              <div className="w-full">
                <LifelinePeople people={people} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})