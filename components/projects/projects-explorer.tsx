"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FolderGit2 } from "lucide-react";
import type { ProjectCard as ProjectCardData } from "@/lib/data/public";
import { FilterBar, readQuery, writeQuery } from "@/components/ui/filter-bar";
import { EmptyState } from "@/components/ui/misc";
import { ProjectCard } from "./project-card";

const EASE = [0.16, 1, 0.3, 1] as const;

export function ProjectsExplorer({ projects }: { projects: ProjectCardData[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [tech, setTech] = useState("");
  const [year, setYear] = useState("");
  const hydrated = useRef(false);

  useEffect(() => {
    const q = readQuery(["q", "category", "tech", "year"]);
    /* eslint-disable react-hooks/set-state-in-effect -- hydrate filters from the URL once */
    setQuery(q.q!);
    setCategory(q.category!);
    setTech(q.tech!);
    setYear(q.year!);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    writeQuery({ q: query, category, tech, year });
  }, [query, category, tech, year]);

  const categories = useMemo(() => [...new Set(projects.map((p) => p.category))].sort(), [projects]);
  const techs = useMemo(() => [...new Set(projects.flatMap((p) => p.technologies))].sort((a, b) => a.localeCompare(b)), [projects]);
  const years = useMemo(() => [...new Set(projects.map((p) => String(p.year)))].sort().reverse(), [projects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter(
      (p) =>
        (!category || p.category === category) &&
        (!tech || p.technologies.includes(tech)) &&
        (!year || String(p.year) === year) &&
        (!q || `${p.title} ${p.excerpt} ${p.technologies.join(" ")}`.toLowerCase().includes(q)),
    );
  }, [projects, query, category, tech, year]);

  const filtering = !!(query || category || tech || year);
  const featured = filtering ? [] : filtered.filter((p) => p.featured);

  const reset = () => {
    setQuery("");
    setCategory("");
    setTech("");
    setYear("");
  };

  return (
    <div className="container-page py-14 sm:py-20">
      <FilterBar
        query={query}
        onQuery={setQuery}
        searchLabel="Search projects"
        filters={[
          { id: "category", label: "All categories", value: category, onChange: setCategory, options: categories.map((c) => ({ value: c, label: c })) },
          { id: "tech", label: "All technologies", value: tech, onChange: setTech, options: techs.map((t) => ({ value: t, label: t })) },
          { id: "year", label: "All years", value: year, onChange: setYear, options: years.map((y) => ({ value: y, label: y })) },
        ]}
        onReset={reset}
        resultLabel={`${filtered.length} project${filtered.length === 1 ? "" : "s"} found`}
      />

      {featured.length > 0 && (
        <section aria-labelledby="featured-projects-heading" className="mt-14">
          <h2 id="featured-projects-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Featured Projects
          </h2>
          <Grid projects={featured} />
        </section>
      )}

      <section aria-labelledby="all-projects-heading" className="mt-16">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="all-projects-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {filtering ? "Matching projects" : "All Published Projects"}
          </h2>
          <span className="text-sm text-muted">{filtered.length}</span>
        </div>
        {filtered.length > 0 ? (
          <Grid projects={filtered} />
        ) : (
          <div className="mt-8">
            <EmptyState
              icon={<FolderGit2 className="size-7" />}
              title={filtering ? "No projects match your filters." : "No projects published yet."}
              action={
                filtering ? (
                  <button type="button" onClick={reset} className="text-sm font-medium underline underline-offset-4">
                    Clear all filters
                  </button>
                ) : undefined
              }
            />
          </div>
        )}
      </section>
    </div>
  );
}

function Grid({ projects }: { projects: ProjectCardData[] }) {
  return (
    <motion.ul layout className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout" initial={false}>
        {projects.map((p) => (
          <motion.li
            key={p.id}
            layout
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <ProjectCard project={p} />
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}
