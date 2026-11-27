// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { YearComparison } from "./YearComparison";

afterEach(cleanup);

const thresholds = { hotDay: 30, veryHotDay: 35, warmNight: 20 };

const years = [
  { year: 2000, meanTemp: 18.5, daysAbove30: 40, daysAbove35: 2, warmNights: 55 },
  { year: 2001, meanTemp: 19.0, daysAbove30: 45, daysAbove35: 3, warmNights: 60 },
  { year: 2002, meanTemp: 20.1, daysAbove30: 50, daysAbove35: 7, warmNights: 70 },
];

describe("YearComparison", () => {
  it("mostra o ano escolhido e o último ano na tabela", () => {
    render(
      <YearComparison years={years} initialYear={2000} thresholds={thresholds} />,
    );

    const headers = screen.getAllByRole("columnheader");
    const columnHeaders = headers.filter((header) => header.getAttribute("scope") === "col");

    expect(columnHeaders[0].textContent).toBe("2000");
    expect(columnHeaders[1].textContent).toBe("2002");
  });

  it("preenche a tabela com os valores do ano escolhido e do último", () => {
    render(
      <YearComparison years={years} initialYear={2000} thresholds={thresholds} />,
    );

    const rows = screen.getAllByRole("row");
    // Primeira linha de dados (Temperatura média): 18,5 °C e 20,1 °C.
    const tempRow = rows.find((row) => within(row).queryByText("Temperatura média"));
    expect(tempRow).toBeTruthy();
    const tempCells = within(tempRow!).getAllByRole("cell");
    expect(tempCells[0].textContent).toContain("18,5");
    expect(tempCells[1].textContent).toContain("20,1");
  });

  it("atualiza a tabela e a frase quando a pessoa troca o ano", async () => {
    const user = userEvent.setup();
    render(
      <YearComparison years={years} initialYear={2000} thresholds={thresholds} />,
    );

    await user.selectOptions(screen.getByRole("combobox"), "2001");

    const headers = screen.getAllByRole("columnheader");
    const columnHeaders = headers.filter((header) => header.getAttribute("scope") === "col");
    expect(columnHeaders[0].textContent).toBe("2001");

    // A frase compara os dias acima de 35 °C: 2002 tem 7, 2001 tem 3,
    // diferença é 4 dias a mais.
    expect(screen.getByText(/4 dias acima de 35 °C a mais/)).toBeTruthy();
  });

  it("mostra uma frase diferente quando o ano escolhido é o último", async () => {
    const user = userEvent.setup();
    render(
      <YearComparison years={years} initialYear={2000} thresholds={thresholds} />,
    );

    await user.selectOptions(screen.getByRole("combobox"), "2002");

    expect(screen.getByText(/último ano completo/)).toBeTruthy();
  });

  it("mostra 'dia' no singular quando a diferença é 1", () => {
    const yearsWithDiff1 = [
      { year: 2000, meanTemp: 18.5, daysAbove30: 40, daysAbove35: 6, warmNights: 55 },
      { year: 2001, meanTemp: 20.1, daysAbove30: 50, daysAbove35: 7, warmNights: 70 },
    ];

    render(
      <YearComparison years={yearsWithDiff1} initialYear={2000} thresholds={thresholds} />,
    );

    expect(screen.getByText(/1 dia acima de 35 °C a mais/)).toBeTruthy();
  });

  it("diz 'a menos' quando o último ano teve menos dias que o escolhido", () => {
    const yearsInverted = [
      { year: 2000, meanTemp: 18.5, daysAbove30: 40, daysAbove35: 10, warmNights: 55 },
      { year: 2001, meanTemp: 20.1, daysAbove30: 50, daysAbove35: 7, warmNights: 70 },
    ];

    render(
      <YearComparison years={yearsInverted} initialYear={2000} thresholds={thresholds} />,
    );

    expect(screen.getByText(/3 dias acima de 35 °C a menos/)).toBeTruthy();
  });

  it("diz que o número foi igual quando a diferença é zero", () => {
    const yearsEqual = [
      { year: 2000, meanTemp: 18.5, daysAbove30: 40, daysAbove35: 7, warmNights: 55 },
      { year: 2001, meanTemp: 20.1, daysAbove30: 50, daysAbove35: 7, warmNights: 70 },
    ];

    render(
      <YearComparison years={yearsEqual} initialYear={2000} thresholds={thresholds} />,
    );

    expect(screen.getByText(/mesmo número/)).toBeTruthy();
  });

  it("lista todos os anos no select", () => {
    render(
      <YearComparison years={years} initialYear={2000} thresholds={thresholds} />,
    );

    const options = screen.getAllByRole("option");

    expect(options).toHaveLength(3);
    expect(options.map((option) => option.textContent)).toEqual(["2000", "2001", "2002"]);
  });
});
