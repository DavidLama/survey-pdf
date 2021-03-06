import { IQuestion, QuestionBooleanModel } from 'survey-core';
import { SurveyPDF } from '../survey';
import { FlatQuestion } from './flat_question';
import { FlatRepository } from './flat_repository';
import { IPoint, DocController } from '../doc_controller';
import { IPdfBrick } from '../pdf_render/pdf_brick'
import { BooleanItemBrick } from '../pdf_render/pdf_booleanitem'; ''
import { CompositeBrick } from '../pdf_render/pdf_composite';
import { SurveyHelper } from '../helper_survey';

export class FlatBoolean extends FlatQuestion {
    protected question: QuestionBooleanModel;
    constructor(protected survey: SurveyPDF,
        question: IQuestion, protected controller: DocController) {
        super(survey, question, controller);
        this.question = <QuestionBooleanModel>question;
    }
    public async generateFlatsContent(point: IPoint): Promise<IPdfBrick[]> {
        let height: number = this.controller.unitHeight;
        let composite: CompositeBrick = new CompositeBrick();
        let itemFlat: IPdfBrick = new BooleanItemBrick(this.question, this.controller,
            SurveyHelper.moveRect(
                SurveyHelper.scaleRect(SurveyHelper.createRect(point, height, height),
                    SurveyHelper.SELECT_ITEM_FLAT_SCALE), point.xLeft));
        composite.addBrick(itemFlat);
        return [composite];
    }
}

FlatRepository.getInstance().register('boolean', FlatBoolean);