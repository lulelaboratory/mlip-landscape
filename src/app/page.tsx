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
                  <strong>Category:</strong>{" "}
                  <span itemProp="applicationCategory">{m.category}</span> ·{" "}
                  <strong>Year:</strong>{" "}
                  <time itemProp="datePublished" dateTime={String(m.year)}>
                    {m.year}
                  </time>{" "}
                  ·{" "}
                  <strong>Authors:</strong>{" "}
                  <span
                    itemProp="author"
                    itemScope
                    itemType="https://schema.org/Organization"
                  >
                    <span itemProp="name">{m.author}</span>
                  </span>
                </p>
                <p itemProp="description">{m.desc}</p>
                {m.license && (
                  <p>
                    License: <span itemProp="license">{m.license}</span>
                  </p>
                )}
                {m.tags && m.tags.length > 0 && (
                  <p>
                    Tags: <span itemProp="keywords">{m.tags.join(", ")}</span>
                  </p>
                )}
                {m.paperUrl && (
                  <p>
                    Paper:{" "}
                    <a href={m.paperUrl} itemProp="url">
                      {m.paperUrl}
                    </a>
                  </p>
                )}
                {m.githubUrl && (
                  <p>
                    Code:{" "}
                    <a href={m.githubUrl} itemProp="codeRepository">
                      {m.githubUrl}
                    </a>
                  </p>
                )}
              </article>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
