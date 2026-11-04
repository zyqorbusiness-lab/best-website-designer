
import os,sys,time
import numpy as np, onnxruntime as ort
from PIL import Image
os.chdir(os.environ.get('BH','.')+'/work')
p='u2net/models/birefnet-general-lite/birefnet-general-lite.onnx'
so=ort.SessionOptions(); so.intra_op_num_threads=int(sys.argv[1]); so.inter_op_num_threads=1; so.enable_cpu_mem_arena=False; so.enable_mem_pattern=False
s=ort.InferenceSession(p,so,providers=['CPUExecutionProvider']); nm=s.get_inputs()[0].name
idx=list(range(1,366))+list(range(1001,1031))
idx=[i for i in idx if not os.path.exists('masks/m%04d.png'%i)]
idx=sorted(idx,key=lambda i:(i%2,i))
mean=np.array([0.485,0.456,0.406],np.float32);std=np.array([0.229,0.224,0.225],np.float32)
t0=time.time()
for n,i in enumerate(idx):
    im=Image.open('src25/f%04d.jpg'%i).convert('RGB')
    a=np.asarray(im.resize((1024,1024),Image.LANCZOS),np.float32)/255
    a=((a-mean)/std).transpose(2,0,1)[None].astype(np.float32)
    o=s.run(None,{nm:a})[0][0,0]
    m=1/(1+np.exp(-o)); m=(m-m.min())/(m.max()-m.min())
    Image.fromarray((m*255).astype(np.uint8)).resize(im.size,Image.LANCZOS).save('masks/tmp_%04d.png'%i); os.replace('masks/tmp_%04d.png'%i,'masks/m%04d.png'%i)
    print(n,len(idx),i,round(time.time()-t0,1),flush=True)
