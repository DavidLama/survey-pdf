import { IQuestion, ItemValue, QuestionCheckboxModel, SurveyElement } from 'survey-core';
import { FlatQuestion } from './flat_question';
import { FlatRepository } from './flat_repository';
import { IPoint, IRect, DocController } from "../doc_controller";
import { IPdfBrick } from '../pdf_render/pdf_brick'
import { CheckItemBrick } from '../pdf_render/pdf_checkitem';
import { TextBrick } from '../pdf_render/pdf_text';
import { CommentBrick } from '../pdf_render/pdf_comment';
import { SurveyHelper } from '../helper_survey';
import { ComposeBrick } from '../pdf_render/pdf_compose';

export class FlatCheckbox extends FlatQuestion {
    protected question: QuestionCheckboxModel;
    constructor(question: IQuestion, protected controller: DocController) {
        super(question, controller);
        this.question = <QuestionCheckboxModel>question;
    }
    private generateFlatsItem(point: IPoint, itemValue: ItemValue, index: number): IPdfBrick {
        let composeFlat: ComposeBrick = new ComposeBrick();
        let height: number = this.controller.measureText().height;
        let itemRect: IRect = SurveyHelper.createRect(point, height, height);
        composeFlat.addBrick(new CheckItemBrick(this.question, this.controller, itemRect, itemValue, index));
        let textPoint: IPoint = SurveyHelper.createPoint(itemRect, false, true);
        let textRect: IRect = SurveyHelper.createTextRect(textPoint, this.controller, itemValue.text);
        composeFlat.addBrick(new TextBrick(this.question, this.controller, textRect, itemValue.text));
        if (itemValue.value === this.question.otherItem.value) {
            let otherPoint: IPoint = SurveyHelper.createPoint(itemRect);
            let otherRect: IRect = SurveyHelper.createTextFieldRect(otherPoint, this.controller, 2);
            composeFlat.addBrick(new CommentBrick(this.question, this.controller, otherRect, false));
        }
        return composeFlat;
    }
    generateFlatsContent(point: IPoint): IPdfBrick[] {
        let currPoint: IPoint = { xLeft: point.xLeft, yTop: point.yTop };
        let flats: IPdfBrick[] = new Array();
        this.question.visibleChoices.forEach((itemValue: ItemValue, index: number) => {
            let itemFlat: IPdfBrick = this.generateFlatsItem(currPoint, itemValue, index);
            currPoint.yTop = itemFlat.yBot;
            flats.push(itemFlat);
        });
        return flats;
    }
}

FlatRepository.getInstance().register('checkbox', FlatCheckbox);