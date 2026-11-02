"use client";

import { useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { saveMemberOrder } from "@/actions/admin/team";
import type { TeamPosition } from "@/lib/db/schema";
import { TEAM_SECTIONS, memberSection, positionLabel, sortMembers, yearLabel, type TeamSectionId } from "@/lib/team";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/misc";
import { useFormAction } from "@/components/ui/use-form-action";
import { Card } from "./ui";

type Member = {
  id: string;
  fullName: string;
  position: TeamPosition;
  customPosition: string | null;
  academicYear: number;
  customYear: string | null;
  image: string | null;
  displayOrder: number;
};
type Order = Partial<Record<TeamSectionId, string[]>>;

function groupIds(members: Member[]): Order {
  const order: Order = {};
  for (const m of sortMembers(members)) (order[memberSection(m)] ??= []).push(m.id);
  return order;
}

const flatten = (order: Order) => TEAM_SECTIONS.flatMap((s) => order[s.id] ?? []);

/** Drag (or use the arrows) to set the order members appear in on the public Team page. */
export function TeamOrderEditor({ termId, members }: { termId: string; members: Member[] }) {
  const saved = groupIds(members);
  const savedKey = flatten(saved).join();
  const [order, setOrder] = useState(saved);
  // Start over from the server's order whenever it changes (after saving or switching terms).
  const [seenKey, setSeenKey] = useState(savedKey);
  if (seenKey !== savedKey) {
    setSeenKey(savedKey);
    setOrder(saved);
  }
  const [announcement, setAnnouncement] = useState("");
  const { onSubmit, pending } = useFormAction(saveMemberOrder, { refreshOnSuccess: true });
  const byId = new Map(members.map((m) => [m.id, m]));
  const ids = flatten(order);
  const dirty = ids.join() !== savedKey;

  const move = (section: TeamSectionId, from: number, to: number) => {
    const list = [...(order[section] ?? [])];
    if (to < 0 || to >= list.length) return;
    const [id] = list.splice(from, 1);
    list.splice(to, 0, id!);
    setOrder({ ...order, [section]: list });
    setAnnouncement(`${byId.get(id!)?.fullName} moved to position ${to + 1} of ${list.length}.`);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <input type="hidden" name="termId" value={termId} />
      {ids.map((id) => (
        <input key={id} type="hidden" name="order" value={id} />
      ))}
      <p role="status" aria-live="polite" className="sr-only">{announcement}</p>

      {TEAM_SECTIONS.map((section) => {
        const list = order[section.id];
        if (!list?.length) return null;
        return (
          <Card key={section.id} title={section.label} description={list.length === 1 ? "Only one member in this section." : undefined}>
            <Reorder.Group as="ol" axis="y" values={list} onReorder={(next: string[]) => setOrder({ ...order, [section.id]: next })} className="space-y-2">
              {list.map((id, index) => {
                const member = byId.get(id);
                if (!member) return null;
                return (
                  <OrderRow
                    key={id}
                    member={member}
                    index={index}
                    count={list.length}
                    onMove={(to) => move(section.id, index, to)}
                  />
                );
              })}
            </Reorder.Group>
          </Card>
        );
      })}

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-2 rounded-2xl border border-line bg-surface/95 p-2 shadow-float backdrop-blur sm:gap-3">
        <span className="mr-auto px-2 text-sm text-muted">{dirty ? "Unsaved changes" : "No changes"}</span>
        <Button type="button" variant="outline" disabled={!dirty || pending} onClick={() => setOrder(saved)}>
          Undo
        </Button>
        <Button type="submit" variant="dark" disabled={!dirty || pending}>
          {pending ? "Saving…" : "Save order"}
        </Button>
      </div>
    </form>
  );
}

function OrderRow({ member, index, count, onMove }: { member: Member; index: number; count: number; onMove: (to: number) => void }) {
  const controls = useDragControls();
  const arrow =
    "inline-flex size-8 items-center justify-center rounded-lg border border-line text-ink/70 hover:bg-mist hover:text-ink disabled:pointer-events-none disabled:opacity-30 sm:size-9";
  return (
    <Reorder.Item
      value={member.id}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-2 rounded-xl border border-line bg-surface px-1.5 py-2 sm:gap-3 sm:px-3"
      whileDrag={{ scale: 1.02, boxShadow: "0 16px 40px -14px rgb(0 0 0 / 0.35)" }}
    >
      <button
        type="button"
        aria-label={`Drag to reorder ${member.fullName}`}
        onPointerDown={(event) => controls.start(event)}
        className="inline-flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-muted hover:bg-mist active:cursor-grabbing sm:size-9"
      >
        <GripVertical aria-hidden className="size-4" />
      </button>
      <span className="hidden w-5 shrink-0 text-right text-sm text-muted tabular-nums sm:inline">{index + 1}</span>
      <Avatar name={member.fullName} src={member.image} size={36} className="hidden size-9 shrink-0 sm:flex" />
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug font-medium break-words">{member.fullName}</p>
        <p className="truncate text-xs text-muted">
          {positionLabel(member)}
          <span className="hidden sm:inline"> · {yearLabel(member)}</span>
        </p>
      </div>
      <div className="flex shrink-0 gap-1 sm:gap-1.5">
        <button type="button" className={arrow} disabled={index === 0} onClick={() => onMove(index - 1)} aria-label={`Move ${member.fullName} up`}>
          <ArrowUp aria-hidden className="size-4" />
        </button>
        <button type="button" className={arrow} disabled={index === count - 1} onClick={() => onMove(index + 1)} aria-label={`Move ${member.fullName} down`}>
          <ArrowDown aria-hidden className="size-4" />
        </button>
      </div>
    </Reorder.Item>
  );
}
