(<any>window)["HTMLCanvasElement"].prototype.getContext = () => {
    return {};
};

import { JsPdfSurveyModel } from "../src/survey";

test("first", () => {
    let survey = new JsPdfSurveyModel({});
    expect(survey).toBeDefined();
});