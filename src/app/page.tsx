import MLIPExplorer from "@/components/MLIPExplorer";
import { INITIAL_NODES, type ModelNode } from "@/data/landscape";

const models = INITIAL_NODES.filter((n): n is ModelNode => n.type === "node");

export default function HomePage() {
  return (
    <>
      <MLIPExplorer />
      {/* Semantic, crawler-friendly mirror of the interactive map. Visible to
          search engines and assistive tech that cannot interpret the canvas. */}
      <section className="sr-only" aria-label="MLIP Hub model directory">
        <h1>MLIP Hub – machine-learning interatomic potentials</h1>
        <p>
          A curated directory of machine-learning interatomic potentials
          (MLIPs). Each entry lists the model name, category, release year,
          authoring group, and a short description.
        </p>
        {/* Kept deliberately lean: name, category, year, author, description
            and links. Richer per-model metadata (license, tags, datasets…)
            lives on /models and in the published JSON snapshot — repeating it
            here roughly doubled the home page's HTML weight (the markup is
            also serialized a second time into the RSC payload). */}
        <ul>
          {models.map((m) => (
            <li key={m.id}>
              <article
                itemScope
                itemType="https://schema.org/SoftwareSourceCode"
                id={`model-${m.id}`}
              >
                <h2 itemProp="name">{m.label}</h2>
                <p>
                  <span itemProp="applicationCategory">{m.category}</span> ·{" "}
                  <time itemProp="datePublished" dateTime={String(m.year)}>
                    {m.year}
                  </time>{" "}
                  · <span itemProp="author">{m.author}</span>
                </p>
                <p itemProp="description">{m.desc}</p>
                {m.paperUrl && (
                  <a href={m.paperUrl} itemProp="url">
                    Paper: {m.label}
                  </a>
                )}
                {m.githubUrl && (
                  <a href={m.githubUrl} itemProp="codeRepository">
                    Code: {m.label}
                  </a>
                )}
              </article>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
