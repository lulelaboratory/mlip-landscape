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
              <article>
                <h2>{m.label}</h2>
                <p>
                  <strong>Category:</strong> {m.category} ·{" "}
                  <strong>Year:</strong> {m.year} ·{" "}
                  <strong>Authors:</strong> {m.author}
                </p>
                <p>{m.desc}</p>
                {m.paperUrl && (
                  <p>
                    Paper: <a href={m.paperUrl}>{m.paperUrl}</a>
                  </p>
                )}
                {m.githubUrl && (
                  <p>
                    Code: <a href={m.githubUrl}>{m.githubUrl}</a>
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
