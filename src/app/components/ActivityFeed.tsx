import { useState } from "react";
import imgEricNieuwkoop from "../../assets/a2737d3b5b234fc04041650cb9f114889c6859da.png";
import imgKhoaNguyen from "../../assets/3627de284acb374a4d9313b3c2dbaeeb87a48224.png";
import imgPelgerDeJong from "../../assets/e7809035038b3816de2a1d67c5de86ebeed325d0.png";
import imgJanWillemVdKraan from "../../assets/9e45f45f537bea4bf653bc0307471e5ff5545f63.png";

/**
 * ActivityFeed — shared component for activity timeline and comment input.
 * Used in detail pages across inbox, bevrachting, and pijplijn contexts.
 */

interface ActivityEvent {
  id: string;
  user: string;
  initials: string;
  avatar: string;
  action: string;
  timestamp: string;
  detail?: string;
}

interface ActivityFeedProps {
  /** Whether to show as a compact section (inbox) or full tab content */
  compact?: boolean;
  /** Filter activity events — "all" shows everything, "mine" shows only current user's activity */
  filter?: "all" | "mine";
}

const CURRENT_USER = "Khoa Nguyen";

export default function ActivityFeed({ compact, filter = "all" }: ActivityFeedProps) {
  const [comment, setComment] = useState("");

  const mockEvents: ActivityEvent[] = [
    {
      id: "1",
      user: "Eric Nieuwkoop",
      initials: "EN",
      avatar: imgEricNieuwkoop,
      action: "heeft de status gewijzigd naar \"In de markt\"",
      timestamp: "Vandaag, 09:15",
    },
    {
      id: "2",
      user: "Khoa Nguyen",
      initials: "KN",
      avatar: imgKhoaNguyen,
      action: "heeft een opmerking geplaatst",
      timestamp: "Gisteren, 16:32",
      detail: "Partij klaargelegd bij terminal 3. Contact opnemen met schipper voor ETA.",
    },
    {
      id: "3",
      user: "Pelger de Jong",
      initials: "PJ",
      avatar: imgPelgerDeJong,
      action: "heeft de eigenaar gewijzigd",
      timestamp: "Ma 3 Mrt, 11:04",
    },
    {
      id: "4",
      user: "Jan-Willem van der Kraan",
      initials: "JK",
      avatar: imgJanWillemVdKraan,
      action: "heeft dit item aangemaakt",
      timestamp: "Vr 28 Feb, 08:47",
    },
  ];

  const filteredEvents = filter === "mine"
    ? mockEvents.filter((e) => e.user === CURRENT_USER)
    : mockEvents;
  const displayEvents = compact ? filteredEvents.slice(0, 2) : filteredEvents;

  return (
    <div className="flex flex-col gap-[16px]">
      {/* Comment input */}
      <div className="bg-white border border-rdj-border-secondary rounded-[12px] p-[16px] w-full">
        <div className="flex gap-[8px] items-start">
          <div className="relative rounded-full shrink-0 size-[32px] bg-rdj-bg-secondary overflow-hidden">
            <img alt="" src={imgKhoaNguyen} className="absolute inset-0 size-full object-cover rounded-full" />
          </div>
          <div className="flex-1 flex flex-col gap-[8px]">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Plaats een opmerking..."
              className="w-full font-sans font-normal leading-[20px] text-rdj-text-primary text-[14px] border-0 outline-none bg-transparent placeholder:text-rdj-text-tertiary"
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex flex-col">
        {displayEvents.map((event, index) => (
          <div key={event.id} className="flex gap-[12px] relative">
            {/* Timeline line */}
            {index < displayEvents.length - 1 && (
              <div className="absolute left-[15px] top-[36px] bottom-0 w-px bg-rdj-border-secondary" />
            )}

            {/* Avatar */}
            <div className="relative rounded-full shrink-0 size-[32px] bg-rdj-bg-secondary overflow-hidden z-[1]">
              <img alt="" src={event.avatar} className="absolute inset-0 size-full object-cover rounded-full" />
            </div>

            {/* Content */}
            <div className="flex-1 pb-[20px]">
              <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">
                <span className="font-sans font-bold text-rdj-text-primary">
                  {event.user}
                </span>{" "}
                {event.action}
              </p>
              <p className="font-sans font-normal leading-[20px] text-rdj-text-tertiary text-[12px] mt-[2px]">
                {event.timestamp}
              </p>
              {event.detail && (
                <div className="mt-[8px] bg-rdj-bg-secondary rounded-[8px] px-[12px] py-[8px]">
                  <p className="font-sans font-normal leading-[20px] text-rdj-text-secondary text-[14px]">
                    {event.detail}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
