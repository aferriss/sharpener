#include "testApp.h"

//--------------------------------------------------------------
void testApp::setup(){
    w = 1920;
    h = 1080;
    
    cam.initGrabber(w, h, true);
    cam.setUseTexture(true);
    ofSetVerticalSync(true);
    ofSetWindowShape(w, h);
    
    ofSetFrameRate(30);

    sharpen.load("sharpen");
    contrast.load("contrast");
    blur.load("blur");
    
    feedback.allocate(w,h,GL_RGBA);
    
    sharpenFbo.allocate(w, h,GL_RGBA);
    sharpenFbo.setUseTexture(true);
    
    contrastFbo.allocate(w, h,GL_RGB);
    contrastFbo.setUseTexture(true);
    
    combine.allocate(w, h,GL_RGBA);
    combine.setUseTexture(true);
    
    blurFbo.allocate(w, h,GL_RGBA);
    blurFbo.setUseTexture(true);
    
    fbPix.allocate(w, h, 4);
    contrastPix.allocate(w, h, 4);
    save = false;

}

//--------------------------------------------------------------
void testApp::update(){
    cam.update();
    
    if(save){
        ofSaveScreen(ofGetTimestampString()+".png");
        save = false;
    }
}

//--------------------------------------------------------------
void testApp::draw(){
    
    if(ofGetKeyPressed('u')){  //update frame if u pressed
        contrastFbo.readToPixels(contrastPix);
        feedback.loadData(contrastPix);
    }
    

    
    sharpenFbo.begin();
    
    
    ofPushStyle();
    //ofSetColor(0);
    //ofCircle(ofGetMouseX(), ofGetMouseY(), 100);
    ofPopStyle();
    
    ofPushStyle();
    ofSetColor(0,0,0,5);
    ofRect(0,0,w,h);
    ofPopStyle();
    
    
    glEnable(GL_BLEND);
    glBlendFunc(GL_ONE_MINUS_DST_COLOR, GL_DST_COLOR);
    
    glTranslatef(0.0, 0.0, ofMap(ofGetMouseX(), 0, w, 0, 250));
    

    glRotatef(ofMap(ofGetMouseY(), 0, w, 0, 10), 1, 0, 0);
    feedback.draw(0,0);
    if(drawSquare){
        ofPushStyle();
        ofSetColor(0, 0, 0);
        ofEllipse(ofGetMouseX(),ofGetMouseY(),200, 200);
        ofPopStyle();
        drawSquare = false;
    }
    sharpen.begin();
    sharpen.setUniformTexture("src_tex_unit0", contrastFbo.getTextureReference(), 0);
    sharpen.setUniform1f("imgWidth", 1.0/1280.0);
    sharpen.setUniform1f("imgHeight", 1.0/720.0);
    feedback.draw(0,0);
    
    
    sharpen.end();
    glDisable(GL_BLEND);
    sharpenFbo.end();
    
    
    sharpenFbo.readToPixels(fbPix);
    feedback.loadData(fbPix);
    
    
    contrastFbo.begin();
    contrast.begin();
    contrast.setUniformTexture("src_tex_unit0", cam.getTextureReference(), 0);
    contrast.setUniform1f("imgWidth", 1);
    contrast.setUniform1f("imgHeight", 1);
    contrast.setUniform1f("contrast", 2);
    cam.draw(0,0);
    contrast.end();
    contrastFbo.end();
    
    
    /*
    combine.begin();
    glEnable(GL_BLEND);
    glBlendFunc(GL_ONE_MINUS_SRC_COLOR, GL_SRC_COLOR);
    sharpenFbo.draw(0, 0);
    ofScale(1,ofGetMouseY());
    sharpenFbo.draw(ofGetMouseX(), 0);
    glDisable(GL_BLEND);
    combine.end();
    */
    //combine.draw(0, 0);
    sharpenFbo.draw(0,0);
    
    
    
    blurFbo.begin();
    blur.begin();
    blur.setUniformTexture("src_tex_unit0", sharpenFbo.getTextureReference(),0);
    blur.setUniform1f("time", ofGetElapsedTimef()*0.250);
    blur.setUniform1f("speed", 0.050);
    sharpenFbo.draw(0,0);
    blur.end();
    blurFbo.end();
    
    
    blurFbo.draw(0, 0);
    
}

//--------------------------------------------------------------
void testApp::keyPressed(int key){
    if(key == 's'){
        save = !save;
    }
}

//--------------------------------------------------------------
void testApp::keyReleased(int key){

}

//--------------------------------------------------------------
void testApp::mouseMoved(int x, int y ){

}

//--------------------------------------------------------------
void testApp::mouseDragged(int x, int y, int button){

}

//--------------------------------------------------------------
void testApp::mousePressed(int x, int y, int button){
    drawSquare = !drawSquare;
}

//--------------------------------------------------------------
void testApp::mouseReleased(int x, int y, int button){

}

//--------------------------------------------------------------
void testApp::windowResized(int w, int h){

}

//--------------------------------------------------------------
void testApp::gotMessage(ofMessage msg){

}

//--------------------------------------------------------------
void testApp::dragEvent(ofDragInfo dragInfo){ 

}