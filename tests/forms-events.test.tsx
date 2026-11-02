import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { eventSchema, projectSchema } from "../lib/validations/admin";
import { PROJECT_CATEGORIES, submissionSchema } from "../lib/validations/public";
import { optionalFacebookAlbumUrl } from "../lib/validations/common";
import { EventGallery } from "../components/events/event-gallery";
import { SelectWithOther } from "../components/ui/select-with-other";

const forms = [
  { label: "admin event", schema: eventSchema, values: {
    title: "Community meetup", slug: "community-meetup", excerpt: "Meet our community at this event.",
    startDate: "2026-12-15", status: "scheduled", category: "Workshop",
  } },
  { label: "admin project and acceptance", schema: projectSchema, values: {
    title: "Community portal", slug: "community-portal", excerpt: "A portal for our local community.",
    year: 2026, status: "completed", category: "Web Application",
  } },
  { label: "public project submission", schema: submissionSchema, values: {
    title: "Community portal", shortDescription: "A portal for our local community.",
    fullDescription: "A student project that connects the local community with useful resources and services.",
    technologies: ["TypeScript"], projectYear: 2026, submitterName: "Test Student",
    submitterEmail: "student@example.com", category: "Web Application",
  } },
] as const;

for (const { label, schema, values } of forms) {
  test(`${label}: custom category is trimmed and persisted without the form-only field`, () => {
    const result = schema.safeParse({ ...values, category: "Other", categoryOther: "  Community outreach  " });
    assert.ok(result.success, JSON.stringify(result.error));
    assert.equal(result.data.category, "Community outreach");
    assert.equal("categoryOther" in result.data, false);
  });

  test(`${label}: Other requires text and enforces the 60-character server limit`, () => {
    for (const categoryOther of [undefined, "", "   ", "x".repeat(61)]) {
      const result = schema.safeParse({ ...values, category: "Other", categoryOther });
      assert.equal(result.success, false);
      if (!result.success) assert.ok(result.error.issues.some((issue) => issue.path[0] === "categoryOther"));
    }
    assert.ok(schema.safeParse({ ...values, category: "Other", categoryOther: "x".repeat(60) }).success);
  });

  test(`${label}: built-in and previously saved custom categories survive edits`, () => {
    const standard = schema.parse({ ...values, categoryOther: "Ignored" });
    assert.equal(standard.category, values.category);
    assert.equal(schema.parse({ ...values, category: "Robotics" }).category, "Robotics");
  });
}

test("custom-category edit form reveals and prepopulates the bounded input", () => {
  const html = renderToStaticMarkup(createElement(SelectWithOther, {
    name: "category", label: "Category", options: PROJECT_CATEGORIES, defaultValue: "Robotics",
  }));
  assert.match(html, /value="Other" selected=""/);
  assert.match(html, /name="categoryOther"/);
  assert.match(html, /maxLength="60"/);
  assert.match(html, /value="Robotics"/);
});

test("standard category does not submit a hidden custom-category input", () => {
  const html = renderToStaticMarkup(createElement(SelectWithOther, {
    name: "category", label: "Category", options: PROJECT_CATEGORIES, defaultValue: "Research",
  }));
  assert.doesNotMatch(html, /name="categoryOther"/);
});

test("Facebook album is optional and accepts HTTPS Facebook links", () => {
  assert.equal(optionalFacebookAlbumUrl.parse(""), null);
  assert.equal(optionalFacebookAlbumUrl.parse(undefined), null);
  for (const url of ["https://www.facebook.com/media/set/?set=a.123&type=3", "https://m.facebook.com/example/albums/123/"]) {
    assert.equal(optionalFacebookAlbumUrl.parse(url), url);
  }
  assert.equal(eventSchema.parse(forms[0].values).facebookAlbumUrl, null);
  const url = "https://www.facebook.com/media/set/?set=a.123&type=3";
  assert.equal(eventSchema.parse({ ...forms[0].values, facebookAlbumUrl: url }).facebookAlbumUrl, url);
});

test("album validation rejects malformed, lookalike, credential-bearing and oversized links", () => {
  for (const url of [
    "not a URL", "javascript:alert(1)", "http://facebook.com/album", "https://facebook.com.attacker.example/album",
    "https://attacker.example/facebook.com/album", "https://user:password@facebook.com/album",
    "https://www.facebook.com:8443/album", `https://facebook.com/${"a".repeat(500)}`,
  ]) assert.equal(optionalFacebookAlbumUrl.safeParse(url).success, false, url);
});

for (const total of [0, 1, 2, 3, 4, 8]) {
  test(`event gallery: ${total} uploads render at most three previews and the exact remaining count`, () => {
    const images = Array.from({ length: total }, (_, index) => ({
      id: `photo-${index}`, imageUrl: `/images/photo-${index}.jpg`, altText: `Photo ${index + 1}`, caption: null,
    }));
    const html = renderToStaticMarkup(createElement(EventGallery, { images, albumUrl: null }));
    assert.equal((html.match(/<img\b/g) ?? []).length, Math.min(total, 3));
    if (total > 3) assert.ok(html.includes(`+${total - 3}`));
    else assert.doesNotMatch(html, /more photos/);
    if (total === 0) assert.equal(html, "");
  });
}

test("an album-only event shows the external link even without uploaded photos", () => {
  const html = renderToStaticMarkup(createElement(EventGallery, {
    images: [], albumUrl: "https://www.facebook.com/media/set/?set=a.123",
  }));
  assert.match(html, /View Facebook album/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.doesNotMatch(html, /<img\b/);
});
