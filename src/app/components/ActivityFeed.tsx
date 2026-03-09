import { useState } from "react";

/**
 * ActivityFeed — shared component for activity timeline and comment input.
 * Used in detail pages across inbox, bevrachting, and pijplijn contexts.
 */

interface ActivityEvent {
  id: string;
  user: string;
  initials: string;
  action: string;
  timestamp: string;
  detail?: string;
}

interface ActivityFeedProps {
  /** Whether to show as a compact section (inbox) or full tab content */
  compact?: boolean;
}

export default function ActivityFeed({ compact }: ActivityFeedProps) {
  const [comment, setComment] = useState("");

  const mockEvents: ActivityEvent[] = [
    {
      id: "1",
      user: "Erick Nieuwkoop",
      initials: "EN",
      action: "heeft de status gewijzigd naar \"In de markt\"",
      timestamp: "Vandaag, 09:15",
    },
    {
      id: "2",
      user: "Khoa Nguyen",
      initials: "KN",
      action: "heeft een opmerking geplaatst",
      timestamp: "Gisteren, 16:32",
      detail: "Partij klaargelegd bij terminal 3. Contact opnemen met schipper voor ETA.",
    },
    {
      id: "3",
      user: "Michiel den Hond",
      initials: "MH",
      action: "heeft de eigenaar gewijzigd",
      timestamp: "Ma 3 Mrt, 11:04",
    },
    {
      id: "4",
      user: "Lisa Aelbrechtse",
      initials: "LA",
      action: "heeft dit item aangemaakt",
      timestamp: "Vr 28 Feb, 08:47",
    },
  ];

  const displayEvents = compact ? mockEvents.slice(0, 2) : mockEvents;

  return (
    <div className="flex flex-col gap-[16px]">
      {/* Comment input */}
      <div className="bg-white border border-rdj-border-secondary rounded-[12px] p-[16px] w-full">
        <div className="flex gap-[8px] items-start">
          <div className="relative rounded-full shrink-0 size-[32px] bg-rdj-bg-secondary flex items-center justify-center">
            <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold text-rdj-text-primary text-[12px]">
              KN
            </p>
          </div>
          <div className="flex-1 flex flex-col gap-[8px]">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Plaats een opmerking..."
              className="w-full font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[20px] text-rdj-text-primary text-[14px] border-0 outline-none bg-transparent placeholder:text-rdj-text-tertiary"
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
            <div className="relative rounded-full shrink-0 size-[32px] bg-rdj-bg-secondary flex items-center justify-center z-[1]">
              <p className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold text-rdj-text-primary text-[12px]">
                {event.initials}
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 pb-[20px]">
              <p className="font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[20px] text-rdj-text-secondary text-[14px]">
                <span className="font-['Hanken_Grotesk:Bold',sans-serif] font-bold text-rdj-text-primary">
                  {event.user}
                </span>{" "}
                {event.action}
              </p>
              <p className="font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[20px] text-rdj-text-tertiary text-[12px] mt-[2px]">
                {event.timestamp}
              </p>
              {event.detail && (
                <div className="mt-[8px] bg-rdj-bg-secondary rounded-[8px] px-[12px] py-[8px]">
                  <p className="font-['Hanken_Grotesk:Regular',sans-serif] font-normal leading-[20px] text-rdj-text-secondary text-[14px]">
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
