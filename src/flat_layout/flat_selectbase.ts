import { IQuestion, ItemValue, QuestionCheckboxBase } from 'survey-core';
import { IPoint, IRect, DocController } from '../doc_controller';
import { SurveyPDF } from '../survey';
import { FlatQuestion } from './flat_question';
import { IPdfBrick } from '../pdf_render/pdf_brick'
import { CompositeBrick } from '../pdf_render/pdf_composite';
import { SurveyHelper } from '../helper_survey';
import { TextBrick } from '../pdf_render/pdf_text';

export abstract class FlatSelectBase extends FlatQuestion {
    protected question: QuestionCheckboxBase;
    public constructor(protected survey: SurveyPDF,
        question: IQuestion, protected controller: DocController) {
        super(survey, question, controller);
        this.question = <QuestionCheckboxBase>question;
    }
    protected abstract generateFlatItem(rect: IRect, item: ItemValue, index: number): IPdfBrick;
    protected async generateFlatComposite(point: IPoint, item: ItemValue, index: number): Promise<IPdfBrick> {
        let compositeFlat: CompositeBrick = new CompositeBrick();
        let itemRect: IRect = SurveyHelper.createRect(point,
            this.controller.unitHeight, this.controller.unitHeight);
        let itemFlat: IPdfBrick = this.generateFlatItem(SurveyHelper.moveRect(
            SurveyHelper.scaleRect(itemRect, SurveyHelper.SELECT_ITEM_FLAT_SCALE),
            point.xLeft), item, index);
        compositeFlat.addBrick(itemFlat);
        let textPoint: IPoint = SurveyHelper.clone(point);
        textPoint.xLeft = itemFlat.xRight + this.controller.unitWidth * SurveyHelper.GAP_BETWEEN_ITEM_TEXT;
        if (item.locText.renderedHtml !== null) {
            compositeFlat.addBrick(await SurveyHelper.createTextFlat(
                textPoint, this.question, this.controller, item.locText, TextBrick));
        }
        if (item.value === this.question.otherItem.value &&
            (item.value === this.question.value ||
            (typeof this.question.isItemSelected !== 'undefined' &&
                this.question.isItemSelected(item)))) {
            let otherPoint: IPoint = SurveyHelper.createPoint(compositeFlat);
            otherPoint.yTop += this.controller.unitHeight * SurveyHelper.GAP_BETWEEN_ROWS;
            compositeFlat.addBrick(SurveyHelper.createOtherFlat(
                otherPoint, this.question, this.controller, index));
        }
        return compositeFlat;
    }
    public async generateFlatsContent(point: IPoint): Promise<IPdfBrick[]> {
        let colCount: number = this.question.colCount;
        if (this.question.colCount == 0) {
            colCount = Math.floor(SurveyHelper.getPageAvailableWidth(this.controller)
                / this.controller.measureText(SurveyHelper.MATRIX_COLUMN_WIDTH).width) || 1;
            if (this.question.visibleChoices.length < colCount) {
                colCount = this.question.visibleChoices.length;
            }
        }
        else if (this.question.colCount > 1) {
            colCount = (SurveyHelper.getColumnWidth(this.controller, this.question.colCount) <
                this.controller.measureText(SurveyHelper.MATRIX_COLUMN_WIDTH).width) ? 1 : this.question.colCount;
        }
        return await (colCount == 1) ? this.generateVerticallyItems(point, this.question.visibleChoices) : this.generateHorisontallyItems(point, colCount);

    }
    protected async generateVerticallyItems(point: IPoint, itemValues: ItemValue[]): Promise<IPdfBrick[]> {
        let currPoint: IPoint = SurveyHelper.clone(point);
        let flats: IPdfBrick[] = [];
        for (let i: number = 0; i < itemValues.length; i++) {
            let itemFlat: IPdfBrick = await this.generateFlatComposite(
                currPoint, itemValues[i], i);
            currPoint.yTop = itemFlat.yBot +
                SurveyHelper.GAP_BETWEEN_ROWS *
                this.controller.unitHeight;
            flats.push(itemFlat);
        }
        return flats;
    }
    protected async generateHorisontallyItems(point: IPoint, colCount: number): Promise<IPdfBrick[]> {
        let currPoint: IPoint = SurveyHelper.clone(point);
        let flats: IPdfBrick[] = [];
        let row: CompositeBrick = new CompositeBrick();
        for (let i: number = 0; i < this.question.visibleChoices.length; i++) {
            this.controller.pushMargins(this.controller.margins.left, this.controller.margins.right);
            SurveyHelper.setColumnMargins(this.controller, colCount, i % colCount);
            currPoint.xLeft = this.controller.margins.left;
            let itemFlat: IPdfBrick = await this.generateFlatComposite(
                currPoint, this.question.visibleChoices[i], i);
            row.addBrick(itemFlat);
            this.controller.popMargins();
            if (i % colCount == colCount - 1 || i == this.question.visibleChoices.length - 1) {
                let rowLineFlat = SurveyHelper.createRowlineFlat(SurveyHelper.createPoint(row), this.controller);
                currPoint.yTop = rowLineFlat.yBot +
                    SurveyHelper.GAP_BETWEEN_ROWS *
                    this.controller.unitHeight;
                flats.push(row, rowLineFlat);
                row = new CompositeBrick();
            }
        }
        return flats;
    }
}
